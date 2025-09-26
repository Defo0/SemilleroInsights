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
  teacherFolder?: any
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
   * Detecta el rol del usuario basado en datos reales de Classroom
   */
  async detectUserRole(userEmail: string): Promise<SimpleUserRole> {
    try {
      // Coordinadores hardcodeados
      const coordinatorEmails = [
        'coordinador@semillerodigital.com',
        'admin@semillerodigital.com',
        'axel@semillerodigital.com'
      ]

      if (coordinatorEmails.includes(userEmail.toLowerCase())) {
        return 'coordinator'
      }

      // Obtener cursos donde el usuario es profesor
      const coursesData = await this.fetchFromClassroom('courses?courseStates=ACTIVE')
      const courses = coursesData.courses || []

      // Verificar si es profesor en algún curso
      for (const course of courses) {
        try {
          const teachersData = await this.fetchFromClassroom(`courses/${course.id}/teachers`)
          const teachers = teachersData.teachers || []
          
          if (teachers.some((t: any) => t.profile?.emailAddress === userEmail)) {
            return 'professor'
          }
        } catch (error) {
          // Si no puede acceder a teachers, continúa
          continue
        }
      }

      // Por defecto es estudiante
      return 'student'
    } catch (error) {
      console.error('Error detecting user role:', error)
      return 'student' // Fallback
    }
  }

  /**
   * Obtiene todos los cursos accesibles
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
   * Obtiene estudiantes de un curso específico
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
   * Obtiene tareas de un curso específico
   */
  async getAssignmentsInCourse(courseId: string): Promise<SimpleAssignment[]> {
    try {
      const data = await this.fetchFromClassroom(`courses/${courseId}/courseWork`)
      const courseName = await this.getCourseName(courseId)
      
      return (data.courseWork || []).map((assignment: any) => ({
        id: assignment.id,
        title: assignment.title,
        description: assignment.description,
        dueDate: assignment.dueDate ? this.formatDueDate(assignment.dueDate) : undefined,
        courseId,
        courseName
      }))
    } catch (error) {
      console.error('Error fetching assignments:', error)
      return []
    }
  }

  /**
   * Obtiene entregas de una tarea específica
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
   * Vista para COORDINADOR: Métricas globales
   */
  async getCoordinatorData(): Promise<any> {
    try {
      const courses = await this.getCourses()
      let totalStudents = 0
      let totalAssignments = 0
      let totalSubmissions = 0
      let completedSubmissions = 0
      let lateSubmissions = 0

      for (const course of courses) {
        // Contar estudiantes
        const students = await this.getStudentsInCourse(course.id)
        totalStudents += students.length

        // Contar tareas y entregas
        const assignments = await this.getAssignmentsInCourse(course.id)
        totalAssignments += assignments.length

        for (const assignment of assignments) {
          const submissions = await this.getSubmissionsForAssignment(course.id, assignment.id)
          totalSubmissions += submissions.length
          completedSubmissions += submissions.filter(s => s.state === 'TURNED_IN').length
          lateSubmissions += submissions.filter(s => s.late).length
        }
      }

      return {
        totalCourses: courses.length,
        totalStudents,
        totalAssignments,
        totalSubmissions,
        completedSubmissions,
        lateSubmissions,
        completionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0,
        courses
      }
    } catch (error) {
      console.error('Error getting coordinator data:', error)
      return {
        totalCourses: 0,
        totalStudents: 0,
        totalAssignments: 0,
        totalSubmissions: 0,
        completedSubmissions: 0,
        lateSubmissions: 0,
        completionRate: 0,
        courses: []
      }
    }
  }

  /**
   * Vista para PROFESOR: Sus cursos y estudiantes
   */
  async getProfessorData(professorEmail: string): Promise<any> {
    try {
      const allCourses = await this.getCourses()
      const professorCourses = []

      // Filtrar cursos donde es profesor
      for (const course of allCourses) {
        try {
          const teachersData = await this.fetchFromClassroom(`courses/${course.id}/teachers`)
          const teachers = teachersData.teachers || []
          
          if (teachers.some((t: any) => t.profile?.emailAddress === professorEmail)) {
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
        } catch (error) {
          continue
        }
      }

      return {
        courses: professorCourses,
        totalStudents: professorCourses.reduce((sum, course) => sum + course.studentCount, 0),
        totalAssignments: professorCourses.reduce((sum, course) => sum + course.assignmentCount, 0)
      }
    } catch (error) {
      console.error('Error getting professor data:', error)
      return {
        courses: [],
        totalStudents: 0,
        totalAssignments: 0
      }
    }
  }

  /**
   * Vista para ESTUDIANTE: Su progreso personal
   */
  async getStudentData(studentEmail: string): Promise<any> {
    try {
      const courses = await this.getCourses()
      const studentCourses = []
      let totalAssignments = 0
      let completedAssignments = 0
      let lateSubmissions = 0

      for (const course of courses) {
        const students = await this.getStudentsInCourse(course.id)
        const studentInCourse = students.find((s: any) => s.profile?.emailAddress === studentEmail)
        
        if (studentInCourse) {
          const assignments = await this.getAssignmentsInCourse(course.id)
          totalAssignments += assignments.length

          for (const assignment of assignments) {
            const submissions = await this.getSubmissionsForAssignment(course.id, assignment.id)
            const studentSubmission = submissions.find(s => s.studentId === studentInCourse.userId)
            
            if (studentSubmission) {
              if (studentSubmission.state === 'TURNED_IN') {
                completedAssignments++
              }
              if (studentSubmission.late) {
                lateSubmissions++
              }
            }
          }

          studentCourses.push({
            ...course,
            assignments
          })
        }
      }

      return {
        courses: studentCourses,
        totalAssignments,
        completedAssignments,
        lateSubmissions,
        completionRate: totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0
      }
    } catch (error) {
      console.error('Error getting student data:', error)
      return {
        courses: [],
        totalAssignments: 0,
        completedAssignments: 0,
        lateSubmissions: 0,
        completionRate: 0
      }
    }
  }

  // Helpers
  private async getCourseName(courseId: string): Promise<string> {
    try {
      const course = await this.fetchFromClassroom(`courses/${courseId}`)
      return course.name || 'Curso sin nombre'
    } catch (error) {
      return 'Curso sin nombre'
    }
  }

  private formatDueDate(dueDate: any): string {
    if (!dueDate) return ''
    
    const { year, month, day } = dueDate
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
  }
}
