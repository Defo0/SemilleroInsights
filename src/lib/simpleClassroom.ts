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
    console.log(`🔍 Detectando rol para: ${userEmail}`)
    
    try {
      // Coordinadores hardcodeados - DEMO SETUP
      const coordinatorEmails = [
        'moreno.moreno04@gmail.com',  // Coordinador principal
        'coordinador@semillerodigital.com',
        'admin@semillerodigital.com',
        'axel@semillerodigital.com'
      ]

      if (coordinatorEmails.includes(userEmail.toLowerCase())) {
        console.log(`✅ ${userEmail} es COORDINADOR (hardcoded)`)
        return 'coordinator'
      }

      // Profesores hardcodeados - DEMO SETUP
      const professorEmails = [
        'semilleroinsights@gmail.com',  // Profesor demo
        'vibeathonprofe@gmail.com'      // Profesor específico solicitado
      ]

      if (professorEmails.includes(userEmail.toLowerCase())) {
        console.log(`✅ ${userEmail} es PROFESOR (hardcoded)`)
        return 'professor'
      }

      // Verificar si es profesor en algún curso
      const courses = await this.getCourses()
      console.log(`📚 Verificando ${courses.length} cursos para detectar rol de ${userEmail}`)
      
      for (const course of courses) {
        try {
          console.log(`🔍 Verificando curso: ${course.name} (${course.id})`)
          const teachersData = await this.fetchFromClassroom(`courses/${course.id}/teachers`)
          const teachers = teachersData.teachers || []
          
          console.log(`👨‍🏫 Profesores en ${course.name}:`, teachers.map((t: any) => t.profile?.emailAddress))
          
          if (teachers.some((t: any) => t.profile?.emailAddress?.toLowerCase() === userEmail.toLowerCase())) {
            console.log(`✅ ${userEmail} es PROFESOR en curso: ${course.name}`)
            return 'professor'
          }
        } catch (error) {
          console.log(`⚠️ Error verificando profesores en curso ${course.name}:`, error)
          continue
        }
      }
      
      // Verificar si es estudiante en algún curso
      for (const course of courses) {
        try {
          const studentsData = await this.fetchFromClassroom(`courses/${course.id}/students`)
          const students = studentsData.students || []
          
          console.log(`👥 Estudiantes en ${course.name}:`, students.map((s: any) => s.profile?.emailAddress))
          
          if (students.some((s: any) => s.profile?.emailAddress?.toLowerCase() === userEmail.toLowerCase())) {
            console.log(`✅ ${userEmail} es ESTUDIANTE en curso: ${course.name}`)
            return 'student'
          }
        } catch (error) {
          console.log(`⚠️ Error verificando estudiantes en curso ${course.name}:`, error)
          continue
        }
      }
      
      // Si no se encuentra en ningún curso, asumir estudiante
      console.log(`⚠️ ${userEmail} no encontrado en ningún curso, asumiendo ESTUDIANTE`)
      return 'student'
      
    } catch (error) {
      console.error('❌ Error detectando rol:', error)
      // Fallback: asumir estudiante
      return 'student'
    }
  }

  /**
   * Obtiene todos los cursos accesibles
{{ ... }}
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
   * Vista para COORDINADOR: Métricas globales (SOLO API REAL)
   */
  async getCoordinatorData(): Promise<any> {
    console.log('🔍 Obteniendo datos de coordinador desde Google Classroom API...')
    
    try {
      const courses = await this.getCourses()
      console.log(`📚 Encontrados ${courses.length} cursos`)
      
      let totalStudents = 0
      let totalAssignments = 0
      let totalSubmissions = 0
      let completedSubmissions = 0
      let lateSubmissions = 0
      const coursesWithDetails = []

      for (const course of courses) {
        console.log(`📖 Procesando curso: ${course.name}`)
        
        // Contar estudiantes
        const students = await this.getStudentsInCourse(course.id)
        totalStudents += students.length
        console.log(`👥 ${students.length} estudiantes en ${course.name}`)

        // Contar tareas y entregas
        const assignments = await this.getAssignmentsInCourse(course.id)
        totalAssignments += assignments.length
        console.log(`📝 ${assignments.length} tareas en ${course.name}`)

        let courseSubmissions = 0
        let courseCompleted = 0
        let courseLate = 0

        for (const assignment of assignments) {
          const submissions = await this.getSubmissionsForAssignment(course.id, assignment.id)
          courseSubmissions += submissions.length
          courseCompleted += submissions.filter(s => s.state === 'TURNED_IN').length
          courseLate += submissions.filter(s => s.late).length
        }

        totalSubmissions += courseSubmissions
        completedSubmissions += courseCompleted
        lateSubmissions += courseLate

        coursesWithDetails.push({
          ...course,
          studentCount: students.length,
          assignmentCount: assignments.length,
          submissionCount: courseSubmissions,
          completedCount: courseCompleted,
          lateCount: courseLate,
          completionRate: courseSubmissions > 0 ? Math.round((courseCompleted / courseSubmissions) * 100) : 0
        })
      }

      const result = {
        totalCourses: courses.length,
        totalStudents,
        totalAssignments,
        totalSubmissions,
        completedSubmissions,
        lateSubmissions,
        completionRate: totalSubmissions > 0 ? Math.round((completedSubmissions / totalSubmissions) * 100) : 0,
        courses: coursesWithDetails,
        // Datos calculados en tiempo real
        weeklyProgress: [
          { week: 'Esta semana', completadas: completedSubmissions, tardias: lateSubmissions }
        ],
        cellMetrics: [] // Se calculará cuando implementemos células
      }

      console.log('✅ Datos de coordinador obtenidos:', result)
      return result

    } catch (error) {
      console.error('❌ Error obteniendo datos de coordinador:', error)
      throw error
    }
  }

  /**
   * Vista para PROFESOR: Sus cursos y estudiantes (SOLO API REAL)
   */
  async getProfessorData(professorEmail: string): Promise<any> {
    console.log(`🔍 Obteniendo datos de profesor para: ${professorEmail}`)
    
    try {
      const allCourses = await this.getCourses()
      console.log(`📚 Encontrados ${allCourses.length} cursos totales:`, allCourses.map(c => c.name))
      
      const professorCourses = []

      // Filtrar cursos donde es profesor
      for (const course of allCourses) {
        try {
          console.log(`🔍 Verificando si ${professorEmail} es profesor en: ${course.name} (ID: ${course.id})`)
          
          const teachersData = await this.fetchFromClassroom(`courses/${course.id}/teachers`)
          const teachers = teachersData.teachers || []
          
          console.log(`👨‍🏫 Profesores encontrados en ${course.name}:`, teachers.map((t: any) => ({
            email: t.profile?.emailAddress,
            name: t.profile?.name?.fullName
          })))
          
          const isTeacher = teachers.some((t: any) => 
            t.profile?.emailAddress?.toLowerCase() === professorEmail.toLowerCase()
          )
          
          if (isTeacher) {
            console.log(`✅ ${professorEmail} ES profesor en: ${course.name}`)
            
            // Obtener estudiantes del curso
            const students = await this.getStudentsInCourse(course.id)
            console.log(`👥 ${students.length} estudiantes en ${course.name}:`, students.map(s => s.profile?.name?.fullName))
            
            // Obtener tareas del curso
            const assignments = await this.getAssignmentsInCourse(course.id)
            console.log(`📝 ${assignments.length} tareas en ${course.name}:`, assignments.map(a => a.title))
            
            // Si no hay estudiantes o tareas, aún mostrar el curso
            if (students.length === 0) {
              console.log(`⚠️ No hay estudiantes en ${course.name}`)
            }
            if (assignments.length === 0) {
              console.log(`⚠️ No hay tareas en ${course.name}`)
            }
            
            // Calcular métricas por estudiante
            const studentsWithMetrics = []
            for (const student of students) {
              let completedTasks = 0
              let totalTasks = assignments.length
              let averageGrade = 0
              let gradeCount = 0
              
              console.log(`📊 Calculando métricas para estudiante: ${student.profile?.name?.fullName}`)
              
              for (const assignment of assignments) {
                try {
                  const submissions = await this.getSubmissionsForAssignment(course.id, assignment.id)
                  const studentSubmission = submissions.find(s => s.studentId === student.userId)
                  
                  if (studentSubmission) {
                    console.log(`📋 Entrega encontrada para ${student.profile?.name?.fullName} en ${assignment.title}: ${studentSubmission.state}`)
                    
                    if (studentSubmission.state === 'TURNED_IN') {
                      completedTasks++
                      if (studentSubmission.assignedGrade) {
                        averageGrade += studentSubmission.assignedGrade
                        gradeCount++
                      }
                    }
                  } else {
                    console.log(`❌ No hay entrega de ${student.profile?.name?.fullName} para ${assignment.title}`)
                  }
                } catch (submissionError) {
                  console.log(`⚠️ Error obteniendo entregas para ${assignment.title}:`, submissionError)
                }
              }
              
              studentsWithMetrics.push({
                ...student,
                completedTasks,
                totalTasks,
                completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
                averageGrade: gradeCount > 0 ? (averageGrade / gradeCount).toFixed(1) : 'N/A',
                lastActivity: new Date().toISOString().split('T')[0] // Placeholder
              })
            }
            
            // Calcular métricas por tarea
            const assignmentsWithMetrics = []
            for (const assignment of assignments) {
              try {
                const submissions = await this.getSubmissionsForAssignment(course.id, assignment.id)
                const submittedCount = submissions.filter(s => s.state === 'TURNED_IN').length
                const pendingCount = students.length - submittedCount
                const lateCount = submissions.filter(s => s.late).length
                
                console.log(`📝 Métricas para ${assignment.title}: ${submittedCount} entregadas, ${pendingCount} pendientes, ${lateCount} tardías`)
                
                assignmentsWithMetrics.push({
                  ...assignment,
                  submissions: submittedCount,
                  pending: pendingCount,
                  late: lateCount,
                  dueDate: assignment.dueDate ? JSON.stringify(assignment.dueDate) : 'Sin fecha'
                })
              } catch (assignmentError) {
                console.log(`⚠️ Error obteniendo métricas para ${assignment.title}:`, assignmentError)
                assignmentsWithMetrics.push({
                  ...assignment,
                  submissions: 0,
                  pending: students.length,
                  late: 0,
                  dueDate: 'Sin fecha'
                })
              }
            }
            
            professorCourses.push({
              ...course,
              students: studentsWithMetrics,
              assignments: assignmentsWithMetrics,
              studentCount: students.length,
              assignmentCount: assignments.length,
              averageCompletion: studentsWithMetrics.length > 0 
                ? Math.round(studentsWithMetrics.reduce((sum, s) => sum + s.completionRate, 0) / studentsWithMetrics.length)
                : 0
            })
          } else {
            console.log(`❌ ${professorEmail} NO es profesor en: ${course.name}`)
          }
        } catch (error) {
          console.error(`❌ Error verificando curso ${course.name}:`, error)
          continue
        }
      }

      const result = {
        courses: professorCourses,
        totalStudents: professorCourses.reduce((sum, course) => sum + course.studentCount, 0),
        totalAssignments: professorCourses.reduce((sum, course) => sum + course.assignmentCount, 0),
        recentActivity: [] // Se calculará en tiempo real después
      }

      console.log(`✅ RESULTADO FINAL - Datos de profesor obtenidos: ${professorCourses.length} cursos`, result)
      
      if (professorCourses.length === 0) {
        console.log(`⚠️ ATENCIÓN: No se encontraron cursos para el profesor ${professorEmail}`)
        console.log(`📋 Cursos disponibles:`, allCourses.map(c => c.name))
      }
      
      return result

    } catch (error) {
      console.error('❌ Error obteniendo datos de profesor:', error)
      throw error
    }
  }

  /**
   * Vista para ESTUDIANTE: Su progreso personal (SOLO API REAL)
   */
  async getStudentData(studentEmail: string): Promise<any> {
    console.log(`🔍 Obteniendo datos de estudiante para: ${studentEmail}`)
    
    try {
      const courses = await this.getCourses()
      console.log(`📚 Revisando ${courses.length} cursos para encontrar los del estudiante`)
      
      const studentCourses = []
      let totalAssignments = 0
      let completedAssignments = 0
      let lateSubmissions = 0
      let totalGrades = 0
      let gradeCount = 0

      for (const course of courses) {
        const students = await this.getStudentsInCourse(course.id)
        const studentInCourse = students.find((s: any) => 
          s.profile?.emailAddress?.toLowerCase() === studentEmail.toLowerCase()
        )
        
        if (studentInCourse) {
          console.log(`✅ ${studentEmail} está inscrito en: ${course.name}`)
          
          const assignments = await this.getAssignmentsInCourse(course.id)
          totalAssignments += assignments.length
          console.log(`📝 ${assignments.length} tareas en ${course.name}`)

          const assignmentsWithStatus = []
          for (const assignment of assignments) {
            const submissions = await this.getSubmissionsForAssignment(course.id, assignment.id)
            const studentSubmission = submissions.find(s => s.studentId === studentInCourse.userId)
            
            let status = 'assigned'
            let grade = null
            let late = false
            let feedback = null
            
            if (studentSubmission) {
              status = studentSubmission.state.toLowerCase()
              late = studentSubmission.late || false
              
              if (studentSubmission.state === 'TURNED_IN') {
                completedAssignments++
                if (studentSubmission.assignedGrade) {
                  grade = studentSubmission.assignedGrade
                  totalGrades += grade
                  gradeCount++
                }
              }
              
              if (studentSubmission.late) {
                lateSubmissions++
              }
            }
            
            assignmentsWithStatus.push({
              ...assignment,
              status,
              grade,
              late,
              feedback
            })
          }

          studentCourses.push({
            ...course,
            assignments: assignmentsWithStatus
          })
        }
      }

      const averageGrade = gradeCount > 0 ? parseFloat((totalGrades / gradeCount).toFixed(1)) : 0
      const completionRate = totalAssignments > 0 ? Math.round((completedAssignments / totalAssignments) * 100) : 0

      const result = {
        courses: studentCourses,
        totalAssignments,
        completedAssignments,
        lateSubmissions,
        completionRate,
        averageGrade,
        // Datos calculados en tiempo real
        weeklyProgress: [
          { week: 'Esta semana', completadas: completedAssignments, tardias: lateSubmissions }
        ],
        recentSubmissions: [], // Se calculará después
        upcomingDeadlines: [] // Se calculará después
      }

      console.log(`✅ Datos de estudiante obtenidos: ${studentCourses.length} cursos`, result)
      return result

    } catch (error) {
      console.error('❌ Error obteniendo datos de estudiante:', error)
      throw error
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
