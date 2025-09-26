import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { ClassroomService } from '../lib/classroom'
import { 
  Users, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Bell,
  Calendar
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts'

interface ProfessorCell {
  cellId: string
  cellName: string
  cellColor: string
  studentCount: number
  completionRate: number
  averageGrade: number
  onTimeRate: number
  recentSubmissions: number
}

interface StudentMetrics {
  studentId: string
  studentName: string
  studentEmail: string
  totalAssignments: number
  completedAssignments: number
  completionRate: number
  averageGrade: number
  onTimeSubmissions: number
  lateSubmissions: number
  missingSubmissions: number
  lastSubmissionDate?: string
}

interface Alert {
  alertType: string
  alertMessage: string
  studentName: string
  assignmentTitle: string
  cellName: string
  createdAt: string
  priority: number
}

export default function ProfessorDashboard() {
  const [loading, setLoading] = useState(true)
  const [selectedCell, setSelectedCell] = useState<string>('')
  const [professorCells, setProfessorCells] = useState<ProfessorCell[]>([])
  const [students, setStudents] = useState<StudentMetrics[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [weeklyProgress, setWeeklyProgress] = useState<any[]>([])
  const classroomService = ClassroomService.getInstance()

  useEffect(() => {
    loadProfessorData()
  }, [])

  useEffect(() => {
    if (selectedCell) {
      loadCellStudents(selectedCell)
    }
  }, [selectedCell])

  const loadProfessorData = async () => {
    try {
      setLoading(true)
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Obtener células asignadas al profesor
      const { data: cellsData, error: cellsError } = await supabase
        .rpc('get_professor_metrics', { professor_id_param: user.id })

      if (cellsError) throw cellsError

      setProfessorCells(cellsData || [])
      
      // Seleccionar la primera célula por defecto
      if (cellsData && cellsData.length > 0) {
        setSelectedCell(cellsData[0].cell_id)
      }

      // Obtener alertas
      const { data: alertsData, error: alertsError } = await supabase
        .rpc('get_alerts_for_professor', { professor_id_param: user.id })

      if (alertsError) throw alertsError
      setAlerts(alertsData || [])

      // Obtener progreso semanal
      const { data: progressData, error: progressError } = await supabase
        .rpc('get_weekly_progress', { weeks_back: 6 })

      if (progressError) throw progressError
      setWeeklyProgress(progressData || [])

    } catch (error) {
      console.error('Error loading professor data:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadCellStudents = async (cellId: string) => {
    try {
      const { data, error } = await supabase
        .rpc('get_cell_students_with_metrics', { cell_id_param: cellId })

      if (error) throw error
      setStudents(data || [])
    } catch (error) {
      console.error('Error loading cell students:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors = {
      excellent: 'text-green-600 bg-green-100',
      good: 'text-blue-600 bg-blue-100',
      warning: 'text-yellow-600 bg-yellow-100',
      danger: 'text-red-600 bg-red-100'
    }
    return colors[status as keyof typeof colors] || colors.good
  }

  const getStudentStatus = (student: StudentMetrics) => {
    if (student.completionRate >= 90) return 'excellent'
    if (student.completionRate >= 75) return 'good'
    if (student.completionRate >= 50) return 'warning'
    return 'danger'
  }

  const selectedCellData = professorCells.find(cell => cell.cellId === selectedCell)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard del Profesor</h1>
        <p className="text-gray-600">Seguimiento personalizado de tus células asignadas</p>
      </div>

      {/* Selector de Célula */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Seleccionar Célula</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {professorCells.map((cell) => (
            <button
              key={cell.cellId}
              onClick={() => setSelectedCell(cell.cellId)}
              className={`p-4 rounded-xl border-2 transition-all ${
                selectedCell === cell.cellId
                  ? 'border-primary bg-primary bg-opacity-5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: cell.cellColor }}
                />
                <div className="text-left">
                  <h4 className="font-medium text-gray-900">{cell.cellName}</h4>
                  <p className="text-sm text-gray-600">{cell.studentCount} estudiantes</p>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-gray-500">Completitud:</span>
                  <span className="ml-1 font-medium">{cell.completionRate}%</span>
                </div>
                <div>
                  <span className="text-gray-500">Promedio:</span>
                  <span className="ml-1 font-medium">{cell.averageGrade}</span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {selectedCellData && (
        <>
          {/* Métricas de la Célula Seleccionada */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Estudiantes</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCellData.studentCount}</p>
                </div>
                <div className="p-3 bg-accent-green bg-opacity-10 rounded-2xl">
                  <Users className="w-6 h-6 text-accent-green" />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completitud</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCellData.completionRate}%</p>
                </div>
                <div className="p-3 bg-accent-teal bg-opacity-10 rounded-2xl">
                  <CheckCircle className="w-6 h-6 text-accent-teal" />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCellData.averageGrade}</p>
                </div>
                <div className="p-3 bg-accent-orange bg-opacity-10 rounded-2xl">
                  <TrendingUp className="w-6 h-6 text-accent-orange" />
                </div>
              </div>
            </div>

            <div className="metric-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">A Tiempo</p>
                  <p className="text-2xl font-bold text-gray-900">{selectedCellData.onTimeRate}%</p>
                </div>
                <div className="p-3 bg-accent-pink bg-opacity-10 rounded-2xl">
                  <Clock className="w-6 h-6 text-accent-pink" />
                </div>
              </div>
            </div>
          </div>

          {/* Alertas y Notificaciones */}
          {alerts.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-accent-orange" />
                <h3 className="text-lg font-semibold text-gray-900">Notificaciones Recientes</h3>
              </div>
              <div className="space-y-3">
                {alerts.slice(0, 5).map((alert, index) => (
                  <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                    <div className={`p-2 rounded-lg ${
                      alert.priority === 1 ? 'bg-green-100' : 'bg-yellow-100'
                    }`}>
                      {alert.priority === 1 ? (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-yellow-600" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{alert.alertMessage}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(alert.createdAt).toLocaleString('es-ES')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Estudiantes */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Estudiantes de {selectedCellData.cellName}
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estudiante</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Completitud</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Promedio</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">A Tiempo</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Tardías</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Faltantes</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student) => {
                    const status = getStudentStatus(student)
                    return (
                      <tr key={student.studentId} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{student.studentName}</p>
                            <p className="text-sm text-gray-500">{student.studentEmail}</p>
                          </div>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-medium">{student.completionRate}%</span>
                          <p className="text-xs text-gray-500">
                            {student.completedAssignments}/{student.totalAssignments}
                          </p>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="font-medium">{student.averageGrade || '-'}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-green-600 font-medium">{student.onTimeSubmissions}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-yellow-600 font-medium">{student.lateSubmissions}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className="text-red-600 font-medium">{student.missingSubmissions}</span>
                        </td>
                        <td className="text-center py-3 px-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                            {status === 'excellent' && 'Excelente'}
                            {status === 'good' && 'Bien'}
                            {status === 'warning' && 'Atención'}
                            {status === 'danger' && 'Crítico'}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Progreso Semanal */}
          {weeklyProgress.length > 0 && (
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso Semanal</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={weeklyProgress}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week_label" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="total_submissions" 
                    stroke="#5a25ab" 
                    strokeWidth={2}
                    name="Total Entregas"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="on_time_submissions" 
                    stroke="#50c69a" 
                    strokeWidth={2}
                    name="A Tiempo"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}

      {professorCells.length === 0 && (
        <div className="card text-center py-12">
          <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hay células asignadas</h3>
          <p className="text-gray-600">
            Contacta al coordinador para que te asigne células de estudiantes.
          </p>
        </div>
      )}
    </div>
  )
}
