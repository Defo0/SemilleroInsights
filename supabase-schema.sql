-- Esquema de base de datos para Semillero Insights
-- Este archivo debe ejecutarse en Supabase SQL Editor

-- Tabla de usuarios (extiende auth.users)
CREATE TABLE public.users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('coordinator', 'professor')),
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de células (grupos de estudiantes)
CREATE TABLE public.cells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#5a25ab',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación profesor-célula
CREATE TABLE public.professor_cells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  professor_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  cell_id UUID REFERENCES public.cells(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(professor_id, cell_id)
);

-- Tabla de estudiantes
CREATE TABLE public.students (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de relación estudiante-célula
CREATE TABLE public.student_cells (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  cell_id UUID REFERENCES public.cells(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, cell_id)
);

-- Tabla de cursos de Google Classroom
CREATE TABLE public.courses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  classroom_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  description TEXT,
  enrollment_code TEXT,
  teacher_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de tareas/assignments
CREATE TABLE public.assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID REFERENCES public.courses(id) ON DELETE CASCADE,
  classroom_id TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP WITH TIME ZONE,
  max_points NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de entregas/submissions
CREATE TABLE public.submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assignment_id UUID REFERENCES public.assignments(id) ON DELETE CASCADE,
  student_id UUID REFERENCES public.students(id) ON DELETE CASCADE,
  status TEXT NOT NULL CHECK (status IN ('turned_in', 'returned', 'reclaimed_by_student', 'new', 'missing')),
  grade NUMERIC,
  submitted_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assignment_id, student_id)
);

-- Índices para mejorar performance
CREATE INDEX idx_professor_cells_professor_id ON public.professor_cells(professor_id);
CREATE INDEX idx_professor_cells_cell_id ON public.professor_cells(cell_id);
CREATE INDEX idx_student_cells_student_id ON public.student_cells(student_id);
CREATE INDEX idx_student_cells_cell_id ON public.student_cells(cell_id);
CREATE INDEX idx_assignments_course_id ON public.assignments(course_id);
CREATE INDEX idx_submissions_assignment_id ON public.submissions(assignment_id);
CREATE INDEX idx_submissions_student_id ON public.submissions(student_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);

-- Políticas de seguridad RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professor_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_cells ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- Política para usuarios: pueden ver y editar su propio perfil
CREATE POLICY "Users can view own profile" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- Política para coordinadores: pueden ver todo
CREATE POLICY "Coordinators can view all data" ON public.cells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

CREATE POLICY "Coordinators can manage cells" ON public.cells
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users 
      WHERE id = auth.uid() AND role = 'coordinator'
    )
  );

-- Política para profesores: pueden ver solo sus células
CREATE POLICY "Professors can view assigned cells" ON public.cells
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.professor_cells pc
      JOIN public.users u ON u.id = pc.professor_id
      WHERE pc.cell_id = cells.id 
      AND u.id = auth.uid() 
      AND u.role = 'professor'
    )
  );

-- Funciones auxiliares para métricas
CREATE OR REPLACE FUNCTION get_cell_metrics(cell_id_param UUID)
RETURNS TABLE (
  student_count BIGINT,
  completion_rate NUMERIC,
  average_grade NUMERIC,
  on_time_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(DISTINCT sc.student_id) as student_count,
    ROUND(
      (COUNT(CASE WHEN s.status = 'turned_in' THEN 1 END) * 100.0) / 
      NULLIF(COUNT(s.id), 0), 2
    ) as completion_rate,
    ROUND(AVG(s.grade), 2) as average_grade,
    ROUND(
      (COUNT(CASE WHEN s.status = 'turned_in' AND s.submitted_at <= a.due_date THEN 1 END) * 100.0) / 
      NULLIF(COUNT(CASE WHEN s.status = 'turned_in' THEN 1 END), 0), 2
    ) as on_time_rate
  FROM public.student_cells sc
  LEFT JOIN public.submissions s ON s.student_id = sc.student_id
  LEFT JOIN public.assignments a ON a.id = s.assignment_id
  WHERE sc.cell_id = cell_id_param;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON public.students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON public.courses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON public.assignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON public.submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
