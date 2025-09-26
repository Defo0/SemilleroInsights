-- Script para poblar células automáticamente después de sincronizar con Google Classroom
-- Este script debe ejecutarse después de la primera sincronización exitosa

-- 1. Crear las células si no existen
INSERT INTO cells (name, color, description) VALUES
('Célula A - Frontend', '#50c69a', 'Especialización en desarrollo frontend y tecnologías web modernas')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cells (name, color, description) VALUES
('Célula B - Backend', '#fa8534', 'Especialización en desarrollo backend y APIs')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cells (name, color, description) VALUES
('Célula C - Data Analytics', '#ed3f70', 'Especialización en análisis de datos y business intelligence')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cells (name, color, description) VALUES
('Célula D - UX/UI Design', '#2ec69d', 'Especialización en diseño de experiencia de usuario')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cells (name, color, description) VALUES
('Célula E - E-commerce', '#af77f4', 'Especialización en comercio electrónico y marketing digital')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cells (name, color, description) VALUES
('Célula F - Marketing Digital', '#fe7ea1', 'Especialización en marketing digital y growth hacking')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cells (name, color, description) VALUES
('Célula G - DevOps', '#fcaf79', 'Especialización en DevOps, CI/CD y deployment')
ON CONFLICT (name) DO NOTHING;

INSERT INTO cells (name, color, description) VALUES
('Célula H - Mobile Development', '#5a25ab', 'Especialización en desarrollo móvil multiplataforma')
ON CONFLICT (name) DO NOTHING;

-- 2. Función para distribuir estudiantes automáticamente en células
CREATE OR REPLACE FUNCTION distribute_students_to_cells()
RETURNS void AS $$
DECLARE
    student_record RECORD;
    cell_record RECORD;
    current_cell_id INTEGER;
    students_per_cell INTEGER := 18; -- Aproximadamente 18 estudiantes por célula
    current_count INTEGER := 0;
    cell_index INTEGER := 0;
    total_cells INTEGER;
BEGIN
    -- Obtener el número total de células
    SELECT COUNT(*) INTO total_cells FROM cells;
    
    -- Limpiar asignaciones existentes (opcional)
    -- DELETE FROM student_cells;
    
    -- Obtener la primera célula
    SELECT id INTO current_cell_id FROM cells ORDER BY name LIMIT 1;
    
    -- Iterar sobre todos los estudiantes ordenados por nombre
    FOR student_record IN 
        SELECT id, name, email FROM students 
        WHERE id NOT IN (SELECT student_id FROM student_cells)
        ORDER BY name
    LOOP
        -- Si hemos alcanzado el límite de estudiantes por célula, cambiar a la siguiente
        IF current_count >= students_per_cell THEN
            cell_index := cell_index + 1;
            current_count := 0;
            
            -- Si hemos usado todas las células, volver a la primera
            IF cell_index >= total_cells THEN
                cell_index := 0;
            END IF;
            
            -- Obtener la siguiente célula
            SELECT id INTO current_cell_id 
            FROM cells 
            ORDER BY name 
            OFFSET cell_index 
            LIMIT 1;
        END IF;
        
        -- Asignar el estudiante a la célula actual
        INSERT INTO student_cells (student_id, cell_id, assigned_at)
        VALUES (student_record.id, current_cell_id, NOW())
        ON CONFLICT (student_id, cell_id) DO NOTHING;
        
        current_count := current_count + 1;
        
        RAISE NOTICE 'Estudiante % asignado a célula %', student_record.name, current_cell_id;
    END LOOP;
    
    RAISE NOTICE 'Distribución de estudiantes completada';
END;
$$ LANGUAGE plpgsql;

-- 3. Función para asignar profesores a células
CREATE OR REPLACE FUNCTION assign_professors_to_cells()
RETURNS void AS $$
DECLARE
    professor_emails TEXT[] := ARRAY[
        'profesor1.semillero@gmail.com',
        'profesor2.semillero@gmail.com', 
        'profesor3.semillero@gmail.com'
    ];
    cell_names TEXT[] := ARRAY[
        'Célula A - Frontend',
        'Célula B - Backend',
        'Célula C - Data Analytics'
    ];
    i INTEGER;
    professor_id INTEGER;
    cell_id INTEGER;
BEGIN
    -- Asignar cada profesor a una célula específica
    FOR i IN 1..array_length(professor_emails, 1) LOOP
        -- Buscar o crear el profesor
        SELECT id INTO professor_id 
        FROM professors 
        WHERE email = professor_emails[i];
        
        -- Si no existe, crearlo
        IF professor_id IS NULL THEN
            INSERT INTO professors (name, email, role, created_at)
            VALUES (
                'Profesor ' || i,
                professor_emails[i],
                'professor',
                NOW()
            )
            RETURNING id INTO professor_id;
        END IF;
        
        -- Obtener la célula correspondiente
        SELECT id INTO cell_id 
        FROM cells 
        WHERE name = cell_names[i];
        
        -- Asignar profesor a la célula
        IF cell_id IS NOT NULL THEN
            INSERT INTO professor_cells (professor_id, cell_id, assigned_at)
            VALUES (professor_id, cell_id, NOW())
            ON CONFLICT (professor_id, cell_id) DO NOTHING;
            
            RAISE NOTICE 'Profesor % asignado a célula %', professor_emails[i], cell_names[i];
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Asignación de profesores completada';
END;
$$ LANGUAGE plpgsql;

-- 4. Ejecutar las funciones
SELECT distribute_students_to_cells();
SELECT assign_professors_to_cells();

-- 5. Verificar la distribución
SELECT 
    c.name as celula,
    c.color,
    COUNT(sc.student_id) as total_estudiantes,
    STRING_AGG(s.name, ', ' ORDER BY s.name) as estudiantes
FROM cells c
LEFT JOIN student_cells sc ON c.id = sc.cell_id
LEFT JOIN students s ON sc.student_id = s.id
GROUP BY c.id, c.name, c.color
ORDER BY c.name;

-- 6. Verificar asignación de profesores
SELECT 
    c.name as celula,
    p.name as profesor,
    p.email as email_profesor
FROM cells c
LEFT JOIN professor_cells pc ON c.id = pc.cell_id
LEFT JOIN professors p ON pc.professor_id = p.id
ORDER BY c.name;

-- 7. Estadísticas finales
SELECT 
    'Total Estudiantes' as metric,
    COUNT(*) as value
FROM students
UNION ALL
SELECT 
    'Estudiantes Asignados a Células' as metric,
    COUNT(*) as value
FROM student_cells
UNION ALL
SELECT 
    'Total Células' as metric,
    COUNT(*) as value
FROM cells
UNION ALL
SELECT 
    'Profesores Asignados' as metric,
    COUNT(*) as value
FROM professor_cells;
