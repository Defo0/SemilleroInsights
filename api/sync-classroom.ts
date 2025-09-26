import { VercelRequest, VercelResponse } from '@vercel/node'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

interface ClassroomCourse {
  id: string
  name: string
  description?: string
  enrollmentCode?: string
  teacherProfile?: {
    name: {
      fullName: string
    }
  }
}

interface ClassroomStudent {
  userId: string
  profile: {
    name: {
      fullName: string
    }
    emailAddress: string
  }
}

interface ClassroomAssignment {
  id: string
  title: string
  description?: string
  dueDate?: {
    year: number
    month: number
    day: number
  }
  dueTime?: {
    hours: number
    minutes: number
  }
  maxPoints?: number
}

interface ClassroomSubmission {
  id: string
  userId: string
  state: 'NEW' | 'CREATED' | 'TURNED_IN' | 'RETURNED' | 'RECLAIMED_BY_STUDENT'
  assignedGrade?: number
  submissionHistory?: Array<{
    stateHistory: {
      state: string
      stateTimestamp: string
    }
  }>
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { access_token } = req.body

    if (!access_token) {
      return res.status(400).json({ error: 'Access token is required' })
    }

    // Sincronizar cursos
    const courses = await fetchClassroomCourses(access_token)
    await syncCourses(courses)

    // Para cada curso, sincronizar estudiantes y tareas
    for (const course of courses) {
      const students = await fetchClassroomStudents(access_token, course.id)
      await syncStudents(students, course.id)

      const assignments = await fetchClassroomAssignments(access_token, course.id)
      await syncAssignments(assignments, course.id)

      // Para cada tarea, sincronizar entregas
      for (const assignment of assignments) {
        const submissions = await fetchClassroomSubmissions(access_token, course.id, assignment.id)
        await syncSubmissions(submissions, assignment.id)
      }
    }

    res.status(200).json({ 
      message: 'Synchronization completed successfully',
      coursesCount: courses.length
    })

  } catch (error) {
    console.error('Sync error:', error)
    res.status(500).json({ 
      error: 'Synchronization failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    })
  }
}

async function fetchClassroomCourses(accessToken: string): Promise<ClassroomCourse[]> {
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

async function fetchClassroomStudents(accessToken: string, courseId: string): Promise<ClassroomStudent[]> {
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

async function fetchClassroomAssignments(accessToken: string, courseId: string): Promise<ClassroomAssignment[]> {
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

async function fetchClassroomSubmissions(accessToken: string, courseId: string, assignmentId: string): Promise<ClassroomSubmission[]> {
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

async function syncCourses(courses: ClassroomCourse[]) {
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

async function syncStudents(students: ClassroomStudent[], courseId: string) {
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

async function syncAssignments(assignments: ClassroomAssignment[], courseId: string) {
  // Obtener el ID interno del curso
  const { data: course } = await supabase
    .from('courses')
    .select('id')
    .eq('classroom_id', courseId)
    .single()

  if (!course) return

  for (const assignment of assignments) {
    let dueDate: string | null = null
    
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

async function syncSubmissions(submissions: ClassroomSubmission[], assignmentId: string) {
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
    const statusMap: Record<string, string> = {
      'NEW': 'new',
      'CREATED': 'new',
      'TURNED_IN': 'turned_in',
      'RETURNED': 'returned',
      'RECLAIMED_BY_STUDENT': 'reclaimed_by_student'
    }

    const status = statusMap[submission.state] || 'new'

    // Obtener fecha de entrega del historial
    let submittedAt: string | null = null
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
