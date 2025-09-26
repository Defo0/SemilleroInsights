import { supabase } from './supabase'

export type UserRole = 'coordinator' | 'professor' | 'student'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: UserRole
  avatar_url?: string
  created_at: string
}

export class UserService {
  
  /**
   * Detecta el rol del usuario basado en su email
   * Coordinadores: emails específicos conocidos
   * Profesores: emails que aparecen como profesores en Classroom
   * Estudiantes: todos los demás
   */
  static detectUserRole(email: string): UserRole {
    // Emails de coordinadores conocidos
    const coordinatorEmails = [
      'coordinador@semillerodigital.com',
      'admin@semillerodigital.com',
      'axel@semillerodigital.com',
      // Agregar emails reales de coordinadores
    ]

    if (coordinatorEmails.includes(email.toLowerCase())) {
      return 'coordinator'
    }

    // Si el email contiene "profesor" o está en lista de profesores
    if (email.toLowerCase().includes('profesor') || 
        email.toLowerCase().includes('teacher') ||
        email.toLowerCase().includes('prof')) {
      return 'professor'
    }

    // Por defecto, es estudiante
    return 'student'
  }

  /**
   * Crea o actualiza el perfil del usuario en la base de datos
   */
  static async createOrUpdateUser(
    userId: string, 
    email: string, 
    name: string, 
    avatarUrl?: string
  ): Promise<UserProfile> {
    
    const role = this.detectUserRole(email)
    
    const userData = {
      id: userId,
      email: email.toLowerCase(),
      name,
      role,
      avatar_url: avatarUrl,
      updated_at: new Date().toISOString()
    }

    // Usar upsert para crear o actualizar
    const { data, error } = await supabase
      .from('users')
      .upsert(userData, { 
        onConflict: 'id',
        ignoreDuplicates: false 
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating/updating user:', error)
      throw error
    }

    return data
  }

  /**
   * Obtiene el perfil del usuario actual
   */
  static async getCurrentUserProfile(): Promise<UserProfile | null> {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null

    // Buscar en nuestra tabla de usuarios
    const { data: profile, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      
      // Si no existe, crearlo
      if (error.code === 'PGRST116') { // No rows returned
        return await this.createOrUpdateUser(
          user.id,
          user.email || '',
          user.user_metadata?.full_name || user.email || 'Usuario',
          user.user_metadata?.avatar_url
        )
      }
      
      return null
    }

    return profile
  }

  /**
   * Obtiene estudiantes asignados a un profesor
   * Basado en el sistema de células
   */
  static async getStudentsForProfessor(professorEmail: string): Promise<any[]> {
    try {
      // Por ahora, simulamos la asignación
      // En producción, esto vendría de la sincronización con Classroom
      const { data: students, error } = await supabase
        .from('students')
        .select(`
          *,
          student_cells!inner(
            cells!inner(
              professor_cells!inner(
                users!inner(email)
              )
            )
          )
        `)
        .eq('student_cells.cells.professor_cells.users.email', professorEmail)

      if (error) {
        console.error('Error fetching students for professor:', error)
        return []
      }

      return students || []
    } catch (error) {
      console.error('Error in getStudentsForProfessor:', error)
      return []
    }
  }

  /**
   * Obtiene todas las métricas para coordinadores
   */
  static async getCoordinatorMetrics(): Promise<any> {
    try {
      // Métricas globales que necesitan los coordinadores
      const [studentsData, coursesData, assignmentsData, submissionsData] = await Promise.all([
        supabase.from('students').select('*'),
        supabase.from('courses').select('*'),
        supabase.from('assignments').select('*'),
        supabase.from('submissions').select('*')
      ])

      const students = studentsData.data || []
      const courses = coursesData.data || []
      const assignments = assignmentsData.data || []
      const submissions = submissionsData.data || []

      // Calcular métricas como en el video
      const totalSubmissions = submissions.length
      const lateSubmissions = submissions.filter(s => s.late === true).length
      const onTimeSubmissions = totalSubmissions - lateSubmissions

      // Métricas por célula (como en el tablero del video)
      const { data: cellMetrics } = await supabase
        .rpc('get_cell_metrics_summary')

      return {
        totalStudents: students.length,
        totalCourses: courses.length,
        totalAssignments: assignments.length,
        totalSubmissions,
        onTimeSubmissions,
        lateSubmissions,
        cellMetrics: cellMetrics || []
      }
    } catch (error) {
      console.error('Error getting coordinator metrics:', error)
      return {
        totalStudents: 0,
        totalCourses: 0,
        totalAssignments: 0,
        totalSubmissions: 0,
        onTimeSubmissions: 0,
        lateSubmissions: 0,
        cellMetrics: []
      }
    }
  }

  /**
   * Obtiene el progreso personal de un estudiante
   */
  static async getStudentProgress(studentEmail: string): Promise<any> {
    try {
      const { data: student } = await supabase
        .from('students')
        .select(`
          *,
          submissions(
            *,
            assignments(title, due_date, course_id)
          )
        `)
        .eq('email', studentEmail)
        .single()

      if (!student) return null

      const submissions = student.submissions || []
      const totalAssignments = submissions.length
      const completedSubmissions = submissions.filter((s: any) => s.status === 'turned_in').length
      const lateSubmissions = submissions.filter((s: any) => s.late === true).length

      return {
        student,
        totalAssignments,
        completedSubmissions,
        lateSubmissions,
        completionRate: totalAssignments > 0 ? Math.round((completedSubmissions / totalAssignments) * 100) : 0,
        submissions
      }
    } catch (error) {
      console.error('Error getting student progress:', error)
      return null
    }
  }
}
