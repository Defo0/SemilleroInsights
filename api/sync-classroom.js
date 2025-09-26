const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const startTime = Date.now()
  let syncStats = {
    courses: 0,
    students: 0,
    assignments: 0,
    submissions: 0
  }

  try {
    const { access_token } = req.body

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' })
    }

    console.log('Starting Google Classroom synchronization...')

    // Sincronizar cursos
    const courses = await fetchClassroomCourses(access_token)
    console.log(`Found ${courses.length} courses`)
    await syncCourses(courses)
    syncStats.courses = courses.length

    // Para cada curso, sincronizar estudiantes y tareas
    for (const course of courses) {
      console.log(`Syncing course: ${course.name} (${course.id})`)
      
      const students = await fetchClassroomStudents(access_token, course.id)
      console.log(`  - Found ${students.length} students`)
      await syncStudents(students, course.id)
      syncStats.students += students.length

      const assignments = await fetchClassroomAssignments(access_token, course.id)
      console.log(`  - Found ${assignments.length} assignments`)
      await syncAssignments(assignments, course.id)
      syncStats.assignments += assignments.length

      // Para cada tarea, sincronizar entregas
      for (const assignment of assignments) {
        const submissions = await fetchClassroomSubmissions(access_token, course.id, assignment.id)
        console.log(`    - Assignment "${assignment.title}": ${submissions.length} submissions`)
        await syncSubmissions(submissions, assignment.id)
        syncStats.submissions += submissions.length
      }
    }

    const duration = Date.now() - startTime
    console.log(`Synchronization completed in ${duration}ms`)

    res.status(200).json({ 
      message: 'Synchronization completed successfully',
      duration: `${duration}ms`,
      stats: syncStats,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    const duration = Date.now() - startTime
    console.error('Sync error:', error)
    
    res.status(500).json({ 
      error: 'Synchronization failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      duration: `${duration}ms`,
      partialStats: syncStats,
      timestamp: new Date().toISOString()
    })
  }
}

async function fetchClassroomCourses(accessToken) {
  const response = await fetch('https://classroom.googleapis.com/v1/courses?teacherIds=me&courseStates=ACTIVE', {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch courses: ${response.statusText}`)
  }

  const data = await response.json()
  return data.courses || []
}

async function fetchClassroomStudents(accessToken, courseId) {
  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/students`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch students for course ${courseId}: ${response.statusText}`)
  }

  const data = await response.json()
  return data.students || []
}

async function fetchClassroomAssignments(accessToken, courseId) {
  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch assignments for course ${courseId}: ${response.statusText}`)
  }

  const data = await response.json()
  return data.courseWork || []
}

async function fetchClassroomSubmissions(accessToken, courseId, assignmentId) {
  const response = await fetch(`https://classroom.googleapis.com/v1/courses/${courseId}/courseWork/${assignmentId}/studentSubmissions`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch submissions for assignment ${assignmentId}: ${response.statusText}`)
  }

  const data = await response.json()
  return data.studentSubmissions || []
}

async function syncCourses(courses) {
  for (const course of courses) {
    const { error } = await supabase
      .from('courses')
      .upsert({
        classroom_id: course.id,
        name: course.name,
        description: course.description,
        enrollment_code: course.enrollmentCode,
        teacher_name: course.teacherProfile?.name?.fullName,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'classroom_id'
      })

    if (error) {
      console.error('Error syncing course:', error)
    }
  }
}

async function syncStudents(students, courseId) {
  for (const student of students) {
    const { error } = await supabase
      .from('students')
      .upsert({
        classroom_id: student.userId,
        name: student.profile.name.fullName,
        email: student.profile.emailAddress,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'classroom_id'
      })

    if (error) {
      console.error('Error syncing student:', error)
    }
  }
}

async function syncAssignments(assignments, courseId) {
  // Obtener el ID interno del curso
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('classroom_id', courseId)
    .single()

  if (!course) return

  for (const assignment of assignments) {
    let dueDate = null
    
    if (assignment.dueDate) {
      const { year, month, day } = assignment.dueDate
      const hours = assignment.dueTime?.hours || 23
      const minutes = assignment.dueTime?.minutes || 59
      
      dueDate = new Date(year, month - 1, day, hours, minutes).toISOString()
    }

    const { error } = await supabase
      .from('assignments')
      .upsert({
        classroom_id: assignment.id,
        course_id: course.id,
        title: assignment.title,
        description: assignment.description,
        due_date: dueDate,
        max_points: assignment.maxPoints,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'classroom_id'
      })

    if (error) {
      console.error('Error syncing assignment:', error)
    }
  }
}

async function syncSubmissions(submissions, assignmentId) {
  // Obtener el ID interno de la tarea
  const { data: assignment } = await supabase
    .from('assignments')
    .select('id')
    .eq('classroom_id', assignmentId)
    .single()

  if (!assignment) return

  for (const submission of submissions) {
    // Obtener el ID interno del estudiante
    const { data: student } = await supabase
      .from('students')
      .select('id')
      .eq('classroom_id', submission.userId)
      .single()

    if (!student) continue

    // Mapear estados de Google Classroom a nuestro esquema
    const statusMap = {
      'NEW': 'new',
      'CREATED': 'new',
      'TURNED_IN': 'turned_in',
      'RETURNED': 'returned',
      'RECLAIMED_BY_STUDENT': 'reclaimed_by_student'
    }

    const status = statusMap[submission.state] || 'new'

    // Obtener fecha de entrega del historial
    let submittedAt = null
    if (submission.submissionHistory) {
      const turnedInEntry = submission.submissionHistory.find(
        entry => entry.stateHistory.state === 'TURNED_IN'
      )
      if (turnedInEntry) {
        submittedAt = turnedInEntry.stateHistory.stateTimestamp
      }
    }

    const { error } = await supabase
      .from('submissions')
      .upsert({
        assignment_id: assignment.id,
        student_id: student.id,
        status,
        grade: submission.assignedGrade,
        submitted_at: submittedAt,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'assignment_id,student_id'
      })

    if (error) {
      console.error('Error syncing submission:', error)
    }
  }
}
