import { supabase } from './supabase'
import { dataMode } from './dataMode'

export interface DashboardMetrics {
  totalStudents: number
  totalCourses: number
  totalAssignments: number
  completionRate: number
  cells: CellData[]
  recentAssignments: AssignmentData[]
  weeklyProgress: WeeklyData[]
}

export interface CellData {
  id?: number
  name: string
  students: number
  completion: number
  color: string
}

export interface AssignmentData {
  id?: number
  name: string
  submissions: number
  total: number
  dueDate: string
  courseId?: number
}

export interface WeeklyData {
  week: string
  entregas: number
  meta: number
}

// Datos mock para fallback
const mockData: DashboardMetrics = {
  totalStudents: 144,
  totalCourses: 3,
  totalAssignments: 24,
  completionRate: 78,
  cells: [
    { name: 'Célula A - Frontend', students: 18, completion: 85, color: '#50c69a' },
    { name: 'Célula B - Backend', students: 16, completion: 72, color: '#fa8534' },
    { name: 'Célula C - Data Analytics', students: 20, completion: 90, color: '#ed3f70' },
    { name: 'Célula D - DevOps', students: 17, completion: 68, color: '#2ec69d' },
    { name: 'Célula E - Mobile', students: 19, completion: 81, color: '#af77f4' },
    { name: 'Célula F - UX/UI', students: 18, completion: 76, color: '#fe7ea1' },
    { name: 'Célula G - Testing', students: 16, completion: 83, color: '#fcaf79' },
    { name: 'Célula H - Security', students: 20, completion: 79, color: '#5a25ab' },
  ],
  recentAssignments: [
    { name: 'HTML Básico', submissions: 120, total: 144, dueDate: '2024-01-15' },
    { name: 'CSS Flexbox', submissions: 98, total: 144, dueDate: '2024-01-18' },
    { name: 'JavaScript Variables', submissions: 134, total: 144, dueDate: '2024-01-20' },
    { name: 'Responsive Design', submissions: 87, total: 144, dueDate: '2024-01-22' },
  ],
  weeklyProgress: [
    { week: 'Sem 1', entregas: 45, meta: 50 },
    { week: 'Sem 2', entregas: 52, meta: 55 },
    { week: 'Sem 3', entregas: 48, meta: 60 },
    { week: 'Sem 4', entregas: 61, meta: 65 },
  ]
}

export class DataService {
  
  static async getDashboardMetrics(): Promise<DashboardMetrics> {
    if (dataMode.isMockMode()) {
      return mockData
    }

    try {
      // Obtener datos reales de Supabase
      const realData = await this.fetchRealData()
      
      // Si no hay datos reales suficientes, usar mock como fallback
      if (!realData || realData.totalStudents === 0) {
        console.log('No real data available, using mock data')
        return mockData
      }

      return realData
    } catch (error) {
      console.error('Error fetching real data, using mock:', error)
      return mockData
    }
  }

  private static async fetchRealData(): Promise<DashboardMetrics> {
    // Obtener métricas básicas
    const [studentsData, coursesData, assignmentsData, submissionsData] = await Promise.all([
      supabase.from('students').select('*'),
      supabase.from('courses').select('*'),
      supabase.from('assignments').select('*'),
      supabase.from('submissions').select('*, assignments(title, due_date), students(name)')
    ])

    const students = studentsData.data || []
    const courses = coursesData.data || []
    const assignments = assignmentsData.data || []
    const submissions = submissionsData.data || []

    // Calcular métricas básicas
    const totalStudents = students.length
    const totalCourses = courses.length
    const totalAssignments = assignments.length
    
    // Calcular tasa de completitud
    const totalPossibleSubmissions = totalStudents * totalAssignments
    const completedSubmissions = submissions.filter(s => s.status === 'turned_in').length
    const completionRate = totalPossibleSubmissions > 0 
      ? Math.round((completedSubmissions / totalPossibleSubmissions) * 100)
      : 0

    // Obtener datos de células
    const cellsData = await this.fetchCellsData()

    // Obtener tareas recientes
    const recentAssignments = await this.fetchRecentAssignments(assignments, submissions, totalStudents)

    // Generar progreso semanal (simplificado por ahora)
    const weeklyProgress = this.generateWeeklyProgress(submissions)

    return {
      totalStudents,
      totalCourses,
      totalAssignments,
      completionRate,
      cells: cellsData,
      recentAssignments,
      weeklyProgress
    }
  }

  private static async fetchCellsData(): Promise<CellData[]> {
    const { data: cellsData } = await supabase
      .from('cells')
      .select(`
        *,
        student_cells(
          students(*)
        )
      `)

    if (!cellsData || cellsData.length === 0) {
      // Si no hay células, crear datos básicos
      return [
        { name: 'Estudiantes Sin Asignar', students: 0, completion: 0, color: '#50c69a' }
      ]
    }

    return cellsData.map(cell => {
      const studentsInCell = cell.student_cells?.length || 0
      
      // Calcular completitud de la célula (simplificado)
      const completion = Math.floor(Math.random() * 30) + 70 // Temporal: 70-100%

      return {
        id: cell.id,
        name: cell.name,
        students: studentsInCell,
        completion,
        color: cell.color || '#50c69a'
      }
    })
  }

  private static async fetchRecentAssignments(
    assignments: any[], 
    submissions: any[], 
    totalStudents: number
  ): Promise<AssignmentData[]> {
    
    return assignments.slice(0, 4).map(assignment => {
      const assignmentSubmissions = submissions.filter(s => s.assignment_id === assignment.id)
      const submissionCount = assignmentSubmissions.filter(s => s.status === 'turned_in').length

      return {
        id: assignment.id,
        name: assignment.title || 'Tarea sin título',
        submissions: submissionCount,
        total: totalStudents,
        dueDate: assignment.due_date || new Date().toISOString().split('T')[0],
        courseId: assignment.course_id
      }
    })
  }

  private static generateWeeklyProgress(submissions: any[]): WeeklyData[] {
    // Generar progreso semanal básico
    // En una implementación real, esto se basaría en fechas de entrega
    const weeks = ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4']
    
    return weeks.map((week) => {
      const entregas = Math.floor(submissions.length / 4) + Math.floor(Math.random() * 10)
      const meta = entregas + Math.floor(Math.random() * 15) + 5
      
      return { week, entregas, meta }
    })
  }

  // Método para obtener datos específicos del profesor
  static async getProfessorData(_professorId: string): Promise<DashboardMetrics> {
    if (dataMode.isMockMode()) {
      // Filtrar datos mock para mostrar solo una célula
      const professorMockData = {
        ...mockData,
        totalStudents: 18,
        cells: mockData.cells.slice(0, 1), // Solo primera célula
        recentAssignments: mockData.recentAssignments.map(a => ({
          ...a,
          total: 18
        }))
      }
      return professorMockData
    }

    // Implementar lógica real para profesores
    return this.getDashboardMetrics()
  }

  // Método para refrescar datos
  static async refreshData(): Promise<void> {
    // Invalidar cache si lo hubiera
    console.log('Refreshing dashboard data...')
  }
}
