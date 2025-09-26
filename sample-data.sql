-- Datos de ejemplo para Semillero Insights
-- Ejecutar después del esquema principal

-- Insertar células (8 células de ~18 estudiantes cada una)
INSERT INTO public.cells (id, name, description, color) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Célula Alpha', 'Grupo de desarrollo web frontend', '#50c69a'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Célula Beta', 'Grupo de desarrollo web backend', '#fa8534'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Célula Gamma', 'Grupo de diseño UX/UI', '#ed3f70'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Célula Delta', 'Grupo de marketing digital', '#2ec69d'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Célula Epsilon', 'Grupo de análisis de datos', '#af77f4'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Célula Zeta', 'Grupo de desarrollo móvil', '#fe7ea1'),
  ('550e8400-e29b-41d4-a716-446655440007', 'Célula Eta', 'Grupo de ciberseguridad', '#fcaf79'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Célula Theta', 'Grupo de inteligencia artificial', '#5a25ab');

-- Insertar cursos de ejemplo
INSERT INTO public.courses (id, classroom_id, name, description, teacher_name) VALUES
  ('650e8400-e29b-41d4-a716-446655440001', 'course_001', 'Fundamentos de Desarrollo Web', 'Curso introductorio de HTML, CSS y JavaScript', 'Prof. María García'),
  ('650e8400-e29b-41d4-a716-446655440002', 'course_002', 'Diseño UX/UI', 'Principios de diseño de experiencia de usuario', 'Prof. Carlos Rodríguez'),
  ('650e8400-e29b-41d4-a716-446655440003', 'course_003', 'Marketing Digital', 'Estrategias de marketing en redes sociales', 'Prof. Ana López');

-- Insertar estudiantes de ejemplo (144 estudiantes total)
DO $$
DECLARE
  i INTEGER;
  student_names TEXT[] := ARRAY[
    'Juan Pérez', 'María González', 'Carlos López', 'Ana Martínez', 'Luis Rodríguez',
    'Carmen Sánchez', 'José García', 'Laura Fernández', 'Miguel Torres', 'Isabel Ruiz',
    'Antonio Morales', 'Pilar Jiménez', 'Francisco Álvarez', 'Rosa Romero', 'Manuel Navarro',
    'Teresa Muñoz', 'Alejandro Ramos', 'Cristina Gil', 'Rafael Serrano', 'Mónica Blanco'
  ];
  cell_ids UUID[] := ARRAY[
    '550e8400-e29b-41d4-a716-446655440001'::UUID,
    '550e8400-e29b-41d4-a716-446655440002'::UUID,
    '550e8400-e29b-41d4-a716-446655440003'::UUID,
    '550e8400-e29b-41d4-a716-446655440004'::UUID,
    '550e8400-e29b-41d4-a716-446655440005'::UUID,
    '550e8400-e29b-41d4-a716-446655440006'::UUID,
    '550e8400-e29b-41d4-a716-446655440007'::UUID,
    '550e8400-e29b-41d4-a716-446655440008'::UUID
  ];
  student_id UUID;
  cell_index INTEGER;
BEGIN
  FOR i IN 1..144 LOOP
    student_id := gen_random_uuid();
    cell_index := ((i - 1) % 8) + 1;
    
    INSERT INTO public.students (id, classroom_id, name, email) VALUES (
      student_id,
      'student_' || LPAD(i::TEXT, 3, '0'),
      student_names[((i - 1) % array_length(student_names, 1)) + 1] || ' ' || i,
      'estudiante' || i || '@semillero.org'
    );
    
    INSERT INTO public.student_cells (student_id, cell_id) VALUES (
      student_id,
      cell_ids[cell_index]
    );
  END LOOP;
END $$;

-- Insertar tareas de ejemplo
INSERT INTO public.assignments (id, course_id, classroom_id, title, description, due_date, max_points) VALUES
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440001', 'assignment_001', 'Introducción a HTML', 'Crear una página web básica con HTML', '2024-01-15 23:59:00', 100),
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440001', 'assignment_002', 'Estilos con CSS', 'Aplicar estilos CSS a la página HTML', '2024-01-18 23:59:00', 100),
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440001', 'assignment_003', 'JavaScript Básico', 'Agregar interactividad con JavaScript', '2024-01-20 23:59:00', 100),
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440001', 'assignment_004', 'Diseño Responsivo', 'Hacer la página responsive', '2024-01-22 23:59:00', 100),
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440002', 'assignment_005', 'Wireframes', 'Crear wireframes para una aplicación móvil', '2024-01-16 23:59:00', 100),
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440002', 'assignment_006', 'Prototipo Figma', 'Diseñar prototipo en Figma', '2024-01-19 23:59:00', 100),
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440003', 'assignment_007', 'Estrategia de Redes', 'Plan de marketing para redes sociales', '2024-01-17 23:59:00', 100),
  (gen_random_uuid(), '650e8400-e29b-41d4-a716-446655440003', 'assignment_008', 'Campaña Publicitaria', 'Crear campaña publicitaria digital', '2024-01-21 23:59:00', 100);

-- Insertar entregas de ejemplo con distribución realista
DO $$
DECLARE
  assignment_record RECORD;
  student_record RECORD;
  submission_status TEXT;
  submission_grade NUMERIC;
  submission_date TIMESTAMP WITH TIME ZONE;
  random_val NUMERIC;
BEGIN
  FOR assignment_record IN SELECT id, due_date FROM public.assignments LOOP
    FOR student_record IN SELECT id FROM public.students LOOP
      random_val := random();
      
      -- 78% de entregas completadas (según especificación)
      IF random_val < 0.78 THEN
        submission_status := 'turned_in';
        submission_grade := 60 + (random() * 40); -- Notas entre 60-100
        
        -- 85% de las entregas a tiempo
        IF random() < 0.85 THEN
          submission_date := assignment_record.due_date - (random() * interval '2 days');
        ELSE
          submission_date := assignment_record.due_date + (random() * interval '3 days');
        END IF;
      ELSE
        -- 22% sin entregar
        submission_status := 'missing';
        submission_grade := NULL;
        submission_date := NULL;
      END IF;
      
      INSERT INTO public.submissions (assignment_id, student_id, status, grade, submitted_at) VALUES (
        assignment_record.id,
        student_record.id,
        submission_status,
        submission_grade,
        submission_date
      );
    END LOOP;
  END LOOP;
END $$;
