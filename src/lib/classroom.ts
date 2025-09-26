import { supabase } from './supabase'

export interface SyncStatus {
  isLoading: boolean
  lastSync?: string
  error?: string
}

export class ClassroomService {
  private static instance: ClassroomService
  private syncStatus: SyncStatus = { isLoading: false }

  static getInstance(): ClassroomService {
    if (!ClassroomService.instance) {
      ClassroomService.instance = new ClassroomService()
    }
    return ClassroomService.instance
  }

  async syncWithClassroom(): Promise<void> {
    try {
      this.syncStatus = { isLoading: true }

      // Obtener el token de acceso del usuario actual
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.provider_token) {
        throw new Error('No access token available. Please login again.')
      }

      // Llamar a la función serverless de sincronización
      const response = await fetch('/api/sync-classroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          access_token: session.provider_token
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Synchronization failed')
      }

      const result = await response.json()
      
      this.syncStatus = {
        isLoading: false,
        lastSync: new Date().toISOString()
      }

      console.log('Sync completed:', result)

    } catch (error) {
      this.syncStatus = {
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
      throw error
    }
  }

  getSyncStatus(): SyncStatus {
    return { ...this.syncStatus }
  }

  async getCoursesFromDB() {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  }

  async getStudentsFromDB() {
    const { data, error } = await supabase
      .from('students')
      .select(`
        *,
        student_cells (
          cell_id,
          cells (
            id,
            name,
            color
          )
        )
      `)
      .order('name')

    if (error) throw error
    return data
  }

  async getAssignmentsFromDB() {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        courses (
          id,
          name
        )
      `)
      .order('due_date', { ascending: false })

    if (error) throw error
    return data
  }

  async getSubmissionsFromDB() {
    const { data, error } = await supabase
      .from('submissions')
      .select(`
        *,
        assignments (
          id,
          title,
          due_date,
          courses (
            name
          )
        ),
        students (
          id,
          name,
          email
        )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async getDashboardMetrics() {
    try {
      // Obtener métricas básicas
      const [studentsResult, coursesResult, assignmentsResult, submissionsResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact' }),
        supabase.from('courses').select('id', { count: 'exact' }),
        supabase.from('assignments').select('id', { count: 'exact' }),
        supabase.from('submissions').select('*')
      ])

      const totalStudents = studentsResult.count || 0
      const totalCourses = coursesResult.count || 0
      const totalAssignments = assignmentsResult.count || 0
      
      const submissions = submissionsResult.data || []
      const completedSubmissions = submissions.filter(s => s.status === 'turned_in')
      const completionRate = submissions.length > 0 
        ? Math.round((completedSubmissions.length / submissions.length) * 100)
        : 0

      // Métricas por célula
      const { data: cellMetrics } = await supabase.rpc('get_cell_metrics_all')

      return {
        totalStudents,
        totalCourses,
        totalAssignments,
        completionRate,
        onTimeSubmissions: completedSubmissions.length,
        lateSubmissions: submissions.filter(s => s.status === 'turned_in' && this.isLateSubmission(s)).length,
        missingSubmissions: submissions.filter(s => s.status === 'missing' || s.status === 'new').length,
        cellMetrics: cellMetrics || []
      }
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error)
      throw error
    }
  }

  async getCellMetrics(cellId?: string) {
    let query = supabase
      .from('student_cells')
      .select(`
        cell_id,
        cells (
          id,
          name,
          color
        ),
        students (
          id,
          submissions (
            status,
            grade,
            submitted_at,
            assignments (
              due_date
            )
          )
        )
      `)

    if (cellId) {
      query = query.eq('cell_id', cellId)
    }

    const { data, error } = await query

    if (error) throw error

    // Procesar datos para calcular métricas
    const cellMetrics = new Map()

    data?.forEach(item => {
      const cellId = item.cell_id
      const cellName = (item.cells as any)?.name || 'Unknown'
      const cellColor = (item.cells as any)?.color || '#5a25ab'

      if (!cellMetrics.has(cellId)) {
        cellMetrics.set(cellId, {
          cellId,
          cellName,
          cellColor,
          studentCount: 0,
          totalSubmissions: 0,
          completedSubmissions: 0,
          onTimeSubmissions: 0,
          totalGrades: 0,
          gradeCount: 0
        })
      }

      const metrics = cellMetrics.get(cellId)
      metrics.studentCount++

      (item.students as any)?.submissions?.forEach((submission: any) => {
        metrics.totalSubmissions++
        
        if (submission.status === 'turned_in') {
          metrics.completedSubmissions++
          
          if (submission.grade) {
            metrics.totalGrades += submission.grade
            metrics.gradeCount++
          }

          // Verificar si fue entregado a tiempo
          if (submission.submitted_at && submission.assignments?.due_date) {
            const submittedAt = new Date(submission.submitted_at)
            const dueDate = new Date(submission.assignments.due_date)
            if (submittedAt <= dueDate) {
              metrics.onTimeSubmissions++
            }
          }
        }
      })
    })

    return Array.from(cellMetrics.values()).map(metrics => ({
      ...metrics,
      completionRate: metrics.totalSubmissions > 0 
        ? Math.round((metrics.completedSubmissions / metrics.totalSubmissions) * 100)
        : 0,
      averageGrade: metrics.gradeCount > 0 
        ? Math.round(metrics.totalGrades / metrics.gradeCount)
        : 0,
      onTimeRate: metrics.completedSubmissions > 0 
        ? Math.round((metrics.onTimeSubmissions / metrics.completedSubmissions) * 100)
        : 0
    }))
  }

  private isLateSubmission(submission: any): boolean {
    if (!submission.submitted_at || !submission.assignments?.due_date) {
      return false
    }
    
    const submittedAt = new Date(submission.submitted_at)
    const dueDate = new Date(submission.assignments.due_date)
    return submittedAt > dueDate
  }

  async getRecentAssignments(limit: number = 10) {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        courses (
          name
        ),
        submissions (
          status,
          student_id
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) throw error

    return data?.map(assignment => {
      const submissions = assignment.submissions || []
      const totalSubmissions = submissions.length
      const completedSubmissions = submissions.filter((s: any) => s.status === 'turned_in').length
      
      return {
        ...assignment,
        totalSubmissions,
        completedSubmissions,
        completionRate: totalSubmissions > 0 
          ? Math.round((completedSubmissions / totalSubmissions) * 100)
          : 0
      }
    })
  }
}
