// Servicio simple que usa SOLO la API de Google Classroom
// Sin base de datos, sin complicaciones

export type SimpleUserRole = 'coordinator' | 'professor' | 'student'

export interface SimpleUser {
  email: string
  name: string
  role: SimpleUserRole
  avatar?: string
}

export interface SimpleCourse {
  id: string
  name: string
  section?: string
  courseState: string
}

export interface SimpleAssignment {
  id: string
  title: string
  description?: string
  dueDate?: string
  courseId: string
  courseName?: string
}

export interface SimpleSubmission {
  id: string
  assignmentId: string
  studentId: string
  studentName?: string
  studentEmail?: string
  state: string
  late: boolean
  assignedGrade?: number
  submissionHistory?: any[]
}

export class SimpleClassroomService {
  private static instance: SimpleClassroomService
  private accessToken: string | null = null

  static getInstance(): SimpleClassroomService {
    if (!SimpleClassroomService.instance) {
      SimpleClassroomService.instance = new SimpleClassroomService()
    }
    return SimpleClassroomService.instance
  }

  setAccessToken(token: string) {
    this.accessToken = token
  }

  private async fetchFromClassroom(endpoint: string) {
    if (!this.accessToken) {
      throw new Error('No access token available')
    }

    const response = await fetch(`https://classroom.googleapis.com/v1/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`Classroom API error: ${response.status}`)
    }

    return response.json()
  }

  /**
   * Detecta el rol del usuario basado en su email
   */
  async detectUserRole(userEmail: string): Promise<SimpleUserRole> {
    console.log(`🔍 Detectando rol para: ${userEmail}`)
    
    // Coordinadores hardcodeados
    const coordinators = [
      'moreno.moreno04@gmail.com',
      'coordinador@semillerodigital.com'
    ]
    
    // Profesores hardcodeados
    const professors = [
      'semilleroinsights@gmail.com',
      'vibeathonprofe@gmail.com'
    ]
    
    if (coordinators.includes(userEmail.toLowerCase())) {
      console.log(`✅ ${userEmail} es COORDINADOR`)
      return 'coordinator'
    }
    
    if (professors.includes(userEmail.toLowerCase())) {
      console.log(`✅ ${userEmail} es PROFESOR`)
      return 'professor'
    }
    
    console.log(`✅ ${userEmail} es ESTUDIANTE`)
    return 'student'
  }

  /**
   * Obtiene todos los cursos
   */
  async getCourses(): Promise<SimpleCourse[]> {
    try {
      const data = await this.fetchFromClassroom('courses?courseStates=ACTIVE')
      return (data.courses || []).map((course: any) => ({
        id: course.id,
        name: course.name,
        section: course.section,
        courseState: course.courseState
      }))
    } catch (error) {
      console.error('Error fetching courses:', error)
      return []
    }
  }

  /**
   * Obtiene estudiantes de un curso
   */
  async getStudentsInCourse(courseId: string): Promise<any[]> {
    try {
      const data = await this.fetchFromClassroom(`courses/${courseId}/students`)
      return data.students || []
    } catch (error) {
      console.error('Error fetching students:', error)
      return []
    }
  }

  /**
   * Obtiene tareas de un curso
   */
  async getAssignmentsInCourse(courseId: string): Promise<SimpleAssignment[]> {
    try {
      const data = await this.fetchFromClassroom(`courses/${courseId}/courseWork`)
      return (data.courseWork || []).map((assignment: any) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate ? JSON.stringify(assignment.dueDate) : undefined,
        courseId,
        courseName: 'Curso'
      }))
    } catch (error) {
      console.error('Error fetching assignments:', error)
      return []
    }
  }

  /**
   * Obtiene entregas de una tarea
   */
  async getSubmissionsForAssignment(courseId: string, assignmentId: string): Promise<SimpleSubmission[]> {
    try {
      const data = await this.fetchFromClassroom(`courses/${courseId}/courseWork/${assignmentId}/studentSubmissions`)
      return (data.studentSubmissions || []).map((submission: any) => ({
        id: submission.id,
        assignmentId,
        studentId: submission.userId,
        state: submission.state,
        late: submission.late || false,
        assignedGrade: submission.assignedGrade,
        submissionHistory: submission.submissionHistory
      }))
    } catch (error) {
      console.error('Error fetching submissions:', error)
      return []
    }
  }

  /**
   * Vista para COORDINADOR
   */
  async getCoordinatorData(): Promise<any> {
    console.log('🔍 Obteniendo datos de coordinador...')
    
    try {
      const courses = await this.getCourses()
      console.log(`📚 Encontrados ${courses.length} cursos`)
      
      let totalStudents = 0
      let totalAssignments = 0
      let totalSubmissions = 0
      let completedSubmissions = 0
      
      const coursesWithDetails = []

      for (const course of courses) {
        const students = await this.getStudentsInCourse(course.id)
        const assignments = await this.getAssignmentsInCourse(course.id)
        
        totalStudents += students.length
        totalAssignments += assignments.length
        
        let courseSubmissions = 0
        let courseCompleted = 0
        
        for (const assignment of assignments) {
          const submissions = await this.getSubmissionsForAssignment(course.id, assignment.id)
          courseSubmissions += submissions.length
          courseCompleted += submissions.filter(s => s.state === 'TURNED_IN').length
        }
        
        totalSubmissions += courseSubmissions
        completedSubmissions += courseCompleted
        
        coursesWithDetails.push({
          ...course,
          studentCount: students.length,
          assignmentCount: assignments.length,
          submissionCount: courseSubmissions,
          completedCount: courseCompleted,
          completionRate: courseSubmissions > 0 ? Math.round((courseCompleted / courseSubmissions) * 100) : 0
        })
      }

      return {
        totalCourses: courses.length,
        totalStudents,
        totalAssignments,
        totalSubmissions,
        completedSubmissions,
        completionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0,
        courses: coursesWithDetails,
        weeklyProgress: [
          { week: 'Esta semana', completadas: completedSubmissions, tardias: 0 }
        ],
        cellMetrics: []
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos de coordinador:', error)
      throw error
    }
  }

  /**
   * Vista para PROFESOR
   */
  async getProfessorData(professorEmail: string): Promise<any> {
    console.log(`🔍 Obteniendo datos de profesor para: ${professorEmail}`)
    
    try {
      const courses = await this.getCourses()
      const professorCourses = []

      for (const course of courses) {
        const students = await this.getStudentsInCourse(course.id)
        const assignments = await this.getAssignmentsInCourse(course.id)
        
        professorCourses.push({
          ...course,
          students,
          assignments,
          studentCount: students.length,
          assignmentCount: assignments.length
        })
      }

      return {
        courses: professorCourses,
        totalStudents: professorCourses.reduce((sum, course) => sum + course.studentCount, 0),
        totalAssignments: professorCourses.reduce((sum, course) => sum + course.assignmentCount, 0),
        recentActivity: []
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos de profesor:', error)
      throw error
    }
  }

  /**
   * Vista para ESTUDIANTE
   */
  async getStudentData(studentEmail: string): Promise<any> {
    console.log(`🔍 Obteniendo datos de estudiante para: ${studentEmail}`)
    
    try {
      const courses = await this.getCourses()
      const studentCourses = []
      
      let totalAssignments = 0
      let completedAssignments = 0

      for (const course of courses) {
        const assignments = await this.getAssignmentsInCourse(course.id)
        totalAssignments += assignments.length
        
        studentCourses.push({
          ...course,
          assignments
        })
      }

      return {
        courses: studentCourses,
        totalAssignments,
        completedAssignments,
        completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0,
        averageGrade: 0,
        weeklyProgress: [
          { week: 'Esta semana', completadas: completedAssignments, tardias: 0 }
        ],
        recentSubmissions: [],
        upcomingDeadlines: []
      }
    } catch (error) {
      console.error('❌ Error obteniendo datos de estudiante:', error)
      throw error
    }
  }
}
