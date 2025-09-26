-- Funciones adicionales para métricas avanzadas

-- Función para obtener métricas de todas las células
CREATE OR REPLACE FUNCTION get_cell_metrics_all()
RETURNS TABLE (
  cell_id UUID,
  cell_name TEXT,
  cell_color TEXT,
  student_count BIGINT,
  completion_rate NUMERIC,
  average_grade NUMERIC,
  on_time_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as cell_id,
    c.name as cell_name,
    c.color as cell_color,
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
  FROM public.cells c
  LEFT JOIN public.student_cells sc ON sc.cell_id = c.id
  LEFT JOIN public.submissions s ON s.student_id = sc.student_id
  LEFT JOIN public.assignments a ON a.id = s.assignment_id
  GROUP BY c.id, c.name, c.color
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener métricas de un profesor específico
CREATE OR REPLACE FUNCTION get_professor_metrics(professor_id_param UUID)
RETURNS TABLE (
  cell_id UUID,
  cell_name TEXT,
  cell_color TEXT,
  student_count BIGINT,
  completion_rate NUMERIC,
  average_grade NUMERIC,
  on_time_rate NUMERIC,
  recent_submissions BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as cell_id,
    c.name as cell_name,
    c.color as cell_color,
    COUNT(DISTINCT sc.student_id) as student_count,
    ROUND(
      (COUNT(CASE WHEN s.status = 'turned_in' THEN 1 END) * 100.0) / 
      NULLIF(COUNT(s.id), 0), 2
    ) as completion_rate,
    ROUND(AVG(s.grade), 2) as average_grade,
    ROUND(
      (COUNT(CASE WHEN s.status = 'turned_in' AND s.submitted_at <= a.due_date THEN 1 END) * 100.0) / 
      NULLIF(COUNT(CASE WHEN s.status = 'turned_in' THEN 1 END), 0), 2
    ) as on_time_rate,
    COUNT(CASE WHEN s.submitted_at >= NOW() - INTERVAL '7 days' THEN 1 END) as recent_submissions
  FROM public.cells c
  INNER JOIN public.professor_cells pc ON pc.cell_id = c.id
  LEFT JOIN public.student_cells sc ON sc.cell_id = c.id
  LEFT JOIN public.submissions s ON s.student_id = sc.student_id
  LEFT JOIN public.assignments a ON a.id = s.assignment_id
  WHERE pc.professor_id = professor_id_param
  GROUP BY c.id, c.name, c.color
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estudiantes de una célula específica con sus métricas
CREATE OR REPLACE FUNCTION get_cell_students_with_metrics(cell_id_param UUID)
RETURNS TABLE (
  student_id UUID,
  student_name TEXT,
  student_email TEXT,
  total_assignments BIGINT,
  completed_assignments BIGINT,
  completion_rate NUMERIC,
  average_grade NUMERIC,
  on_time_submissions BIGINT,
  late_submissions BIGINT,
  missing_submissions BIGINT,
  last_submission_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    st.id as student_id,
    st.name as student_name,
    st.email as student_email,
    COUNT(s.id) as total_assignments,
    COUNT(CASE WHEN s.status = 'turned_in' THEN 1 END) as completed_assignments,
    ROUND(
      (COUNT(CASE WHEN s.status = 'turned_in' THEN 1 END) * 100.0) / 
      NULLIF(COUNT(s.id), 0), 2
    ) as completion_rate,
    ROUND(AVG(CASE WHEN s.status = 'turned_in' THEN s.grade END), 2) as average_grade,
    COUNT(CASE WHEN s.status = 'turned_in' AND s.submitted_at <= a.due_date THEN 1 END) as on_time_submissions,
    COUNT(CASE WHEN s.status = 'turned_in' AND s.submitted_at > a.due_date THEN 1 END) as late_submissions,
    COUNT(CASE WHEN s.status IN ('missing', 'new') THEN 1 END) as missing_submissions,
    MAX(s.submitted_at) as last_submission_date
  FROM public.students st
  INNER JOIN public.student_cells sc ON sc.student_id = st.id
  LEFT JOIN public.submissions s ON s.student_id = st.id
  LEFT JOIN public.assignments a ON a.id = s.assignment_id
  WHERE sc.cell_id = cell_id_param
  GROUP BY st.id, st.name, st.email
  ORDER BY st.name;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener progreso semanal
CREATE OR REPLACE FUNCTION get_weekly_progress(weeks_back INTEGER DEFAULT 4)
RETURNS TABLE (
  week_start DATE,
  week_label TEXT,
  total_submissions BIGINT,
  on_time_submissions BIGINT,
  late_submissions BIGINT,
  completion_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  WITH weekly_data AS (
    SELECT 
      DATE_TRUNC('week', s.submitted_at)::DATE as week_start,
      COUNT(*) as total_submissions,
      COUNT(CASE WHEN s.submitted_at <= a.due_date THEN 1 END) as on_time_submissions,
      COUNT(CASE WHEN s.submitted_at > a.due_date THEN 1 END) as late_submissions
    FROM public.submissions s
    INNER JOIN public.assignments a ON a.id = s.assignment_id
    WHERE s.status = 'turned_in' 
      AND s.submitted_at >= CURRENT_DATE - INTERVAL '1 week' * weeks_back
    GROUP BY DATE_TRUNC('week', s.submitted_at)::DATE
  )
  SELECT 
    wd.week_start,
    'Sem ' || EXTRACT(WEEK FROM wd.week_start)::TEXT as week_label,
    wd.total_submissions,
    wd.on_time_submissions,
    wd.late_submissions,
    ROUND((wd.on_time_submissions * 100.0) / NULLIF(wd.total_submissions, 0), 2) as completion_rate
  FROM weekly_data wd
  ORDER BY wd.week_start;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener alertas y notificaciones
CREATE OR REPLACE FUNCTION get_alerts_for_professor(professor_id_param UUID)
RETURNS TABLE (
  alert_type TEXT,
  alert_message TEXT,
  student_name TEXT,
  assignment_title TEXT,
  cell_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  priority INTEGER
) AS $$
BEGIN
  RETURN QUERY
  -- Entregas recientes (últimas 24 horas)
  SELECT 
    'new_submission'::TEXT as alert_type,
    ('Nueva entrega de ' || st.name || ' para "' || a.title || '"')::TEXT as alert_message,
    st.name as student_name,
    a.title as assignment_title,
    c.name as cell_name,
    s.submitted_at as created_at,
    1 as priority
  FROM public.submissions s
  INNER JOIN public.students st ON st.id = s.student_id
  INNER JOIN public.assignments a ON a.id = s.assignment_id
  INNER JOIN public.student_cells sc ON sc.student_id = st.id
  INNER JOIN public.cells c ON c.id = sc.cell_id
  INNER JOIN public.professor_cells pc ON pc.cell_id = c.id
  WHERE pc.professor_id = professor_id_param
    AND s.status = 'turned_in'
    AND s.submitted_at >= NOW() - INTERVAL '24 hours'
  
  UNION ALL
  
  -- Tareas próximas a vencer sin entregar
  SELECT 
    'missing_assignment'::TEXT as alert_type,
    ('Tarea "' || a.title || '" vence pronto - ' || st.name || ' no ha entregado')::TEXT as alert_message,
    st.name as student_name,
    a.title as assignment_title,
    c.name as cell_name,
    a.due_date as created_at,
    2 as priority
  FROM public.assignments a
  INNER JOIN public.courses co ON co.id = a.course_id
  CROSS JOIN public.students st
  INNER JOIN public.student_cells sc ON sc.student_id = st.id
  INNER JOIN public.cells c ON c.id = sc.cell_id
  INNER JOIN public.professor_cells pc ON pc.cell_id = c.id
  LEFT JOIN public.submissions s ON s.assignment_id = a.id AND s.student_id = st.id
  WHERE pc.professor_id = professor_id_param
    AND a.due_date BETWEEN NOW() AND NOW() + INTERVAL '48 hours'
    AND (s.id IS NULL OR s.status IN ('new', 'missing'))
  
  ORDER BY priority, created_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Función para obtener estadísticas de distribución de células
CREATE OR REPLACE FUNCTION get_cell_distribution_stats()
RETURNS TABLE (
  cell_id UUID,
  cell_name TEXT,
  cell_color TEXT,
  student_count BIGINT,
  professor_name TEXT,
  professor_email TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id as cell_id,
    c.name as cell_name,
    c.color as cell_color,
    COUNT(sc.student_id) as student_count,
    p.name as professor_name,
    p.email as professor_email
  FROM public.cells c
  LEFT JOIN public.student_cells sc ON c.id = sc.cell_id
  LEFT JOIN public.professor_cells pc ON c.id = pc.cell_id
  LEFT JOIN public.professors p ON pc.professor_id = p.id
  GROUP BY c.id, c.name, c.color, p.name, p.email
  ORDER BY c.name;
END;
$$ LANGUAGE plpgsql;
