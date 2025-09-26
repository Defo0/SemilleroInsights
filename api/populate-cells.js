const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    console.log('Starting cell population process...')

    // 1. Crear células si no existen (versión simplificada para demo)
    const cellsData = [
      { name: 'Célula A - Frontend', color: '#50c69a', description: 'Especialización en desarrollo frontend y tecnologías web modernas' },
      { name: 'Célula B - Backend', color: '#fa8534', description: 'Especialización en desarrollo backend y APIs' },
      { name: 'Célula C - Data Analytics', color: '#ed3f70', description: 'Especialización en análisis de datos y business intelligence' }
    ]

    // Verificar si las células ya existen
    const { data: existingCells } = await supabase
      .from('cells')
      .select('*')

    let cells = existingCells || []

    // Solo insertar células que no existen
    if (cells.length === 0) {
      const { data: newCells, error: cellsError } = await supabase
        .from('cells')
        .insert(cellsData)
        .select()

      if (cellsError) {
        throw new Error(`Error creating cells: ${cellsError.message}`)
      }
      
      cells = newCells || []
    }

    console.log(`Created/updated ${cells?.length || 0} cells`)

    // 2. Obtener todos los estudiantes sin asignar
    const { data: unassignedStudents, error: studentsError } = await supabase
      .from('students')
      .select('id, name, email')
      .order('name')

    if (studentsError) {
      throw new Error(`Error fetching students: ${studentsError.message}`)
    }

    if (!unassignedStudents || unassignedStudents.length === 0) {
      return res.status(200).json({
        message: 'No students found to assign to cells',
        stats: { cells: cells?.length || 0, students: 0, assignments: 0 }
      })
    }

    // 3. Distribuir estudiantes en células (adaptado para pocos estudiantes)
    const assignments = []
    
    for (let i = 0; i < unassignedStudents.length; i++) {
      // Para demo con pocos estudiantes, usar siempre la primera célula
      const targetCell = cells?.[0] // Usar primera célula para demo
      
      if (targetCell) {
        assignments.push({
          student_id: unassignedStudents[i].id,
          cell_id: targetCell.id
        })
      }
    }

    // 4. Insertar asignaciones (evitar duplicados)
    let insertedAssignments = []
    
    if (assignments.length > 0) {
      // Verificar asignaciones existentes
      const { data: existingAssignments } = await supabase
        .from('student_cells')
        .select('student_id, cell_id')

      // Filtrar solo asignaciones nuevas
      const newAssignments = assignments.filter(assignment => 
        !existingAssignments?.some(existing => 
          existing.student_id === assignment.student_id && existing.cell_id === assignment.cell_id
        )
      )

      if (newAssignments.length > 0) {
        const { data: newInsertedAssignments, error: assignmentError } = await supabase
          .from('student_cells')
          .insert(newAssignments)
          .select()

        if (assignmentError) {
          throw new Error(`Error assigning students to cells: ${assignmentError.message}`)
        }
        
        insertedAssignments = newInsertedAssignments || []
      }
    }

    // 5. Crear profesores de ejemplo si no existen
    const professorsData = [
      { name: 'Prof. María García', email: 'profesor1.semillero@gmail.com', role: 'professor' },
      { name: 'Prof. Carlos López', email: 'profesor2.semillero@gmail.com', role: 'professor' },
      { name: 'Prof. Ana Martínez', email: 'profesor3.semillero@gmail.com', role: 'professor' }
    ]

    // Verificar si los profesores ya existen
    const { data: existingProfessors } = await supabase
      .from('professors')
      .select('*')

    let professors = existingProfessors || []

    // Solo crear profesores si no existen
    if (professors.length === 0) {
      const { data: newProfessors, error: professorsError } = await supabase
        .from('professors')
        .insert(professorsData)
        .select()

      if (professorsError) {
        console.warn('Error creating professors:', professorsError.message)
      } else {
        professors = newProfessors || []
      }
    }

    // 6. Asignar profesores a las primeras 3 células
    if (professors && professors.length > 0 && cells && cells.length > 0) {
      const professorAssignments = []
      
      for (let i = 0; i < Math.min(professors.length, 3); i++) {
        professorAssignments.push({
          professor_id: professors[i].id,
          cell_id: cells[i].id
        })
      }

      // Verificar asignaciones existentes de profesores
      const { data: existingProfAssignments } = await supabase
        .from('professor_cells')
        .select('professor_id, cell_id')

      // Filtrar solo asignaciones nuevas
      const newProfAssignments = professorAssignments.filter(assignment => 
        !existingProfAssignments?.some(existing => 
          existing.professor_id === assignment.professor_id && existing.cell_id === assignment.cell_id
        )
      )

      if (newProfAssignments.length > 0) {
        await supabase
          .from('professor_cells')
          .insert(newProfAssignments)
      }
    }

    // 7. Obtener estadísticas finales
    const { data: finalStats } = await supabase
      .rpc('get_cell_distribution_stats')

    console.log('Cell population completed successfully')

    res.status(200).json({
      message: 'Cells populated successfully',
      stats: {
        cells: cells?.length || 0,
        students: unassignedStudents.length,
        assignments: insertedAssignments?.length || 0,
        professors: professors?.length || 0
      },
      distribution: finalStats || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cell population error:', error)
    res.status(500).json({
      error: 'Failed to populate cells',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })
  }
}
