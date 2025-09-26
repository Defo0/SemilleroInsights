import { useState, useEffect } from 'react'
import { UserService } from '../lib/userService'
import { supabase } from '../lib/supabase'
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  TrendingUp,
  Calendar,
  FileText
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

interface StudentProgress {
  student: any
  totalAssignments: number
  completedSubmissions: number
  lateSubmissions: number
  completionRate: number
  submissions: any[]
}

export default function StudentDashboard() {
  const [loading, setLoading] = useState(true)
  const [progress, setProgress] = useState<StudentProgress | null>(null)
  const [recentSubmissions, setRecentSubmissions] = useState<any[]>([])

  useEffect(() => {
    loadStudentProgress()
  }, [])

  const loadStudentProgress = async () => {
    try {
      setLoading(true)
      
      // Obtener el usuario actual
      const { data: { user } } = await supabase.auth.getUser()
      if (!user?.email) return

      // Obtener progreso del estudiante
      const studentProgress = await UserService.getStudentProgress(user.email)
      
      if (studentProgress) {
        setProgress(studentProgress)
        
        // Ordenar submissions por fecha más reciente
        const recent = studentProgress.submissions
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5)
        
        setRecentSubmissions(recent)
      }

    } catch (error) {
      console.error('Error loading student progress:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!progress) {
    return (
      <div className="card text-center py-12">
        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No se encontraron datos
        </h3>
        <p className="text-gray-600">
          Parece que aún no tienes tareas asignadas o no estás registrado como estudiante.
        </p>
      </div>
    )
  }

  // Preparar datos para el gráfico de progreso semanal
  const weeklyData = [
    { week: 'Sem 1', completadas: Math.floor(progress.completedSubmissions * 0.2) },
    { week: 'Sem 2', completadas: Math.floor(progress.completedSubmissions * 0.3) },
    { week: 'Sem 3', completadas: Math.floor(progress.completedSubmissions * 0.25) },
    { week: 'Sem 4', completadas: Math.floor(progress.completedSubmissions * 0.25) },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Mi Progreso</h1>
        <p className="text-gray-600">
          Seguimiento de tu desempeño académico en Semillero Digital
        </p>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tareas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{progress.totalAssignments}</p>
            </div>
            <div className="p-3 bg-accent-blue bg-opacity-10 rounded-2xl">
              <FileText className="w-6 h-6 text-accent-blue" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completadas</p>
              <p className="text-2xl font-bold text-gray-900">{progress.completedSubmissions}</p>
            </div>
            <div className="p-3 bg-accent-green bg-opacity-10 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-accent-green" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Entregas Tardías</p>
              <p className="text-2xl font-bold text-gray-900">{progress.lateSubmissions}</p>
            </div>
            <div className="p-3 bg-accent-orange bg-opacity-10 rounded-2xl">
              <Clock className="w-6 h-6 text-accent-orange" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">% Completitud</p>
              <p className="text-2xl font-bold text-gray-900">{progress.completionRate}%</p>
            </div>
            <div className="p-3 bg-accent-teal bg-opacity-10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-accent-teal" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso Semanal */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mi Progreso Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="completadas" fill="#5a25ab" name="Tareas Completadas" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Estado de Tareas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado General</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-900">Tareas Completadas</p>
                  <p className="text-sm text-green-700">Entregas realizadas a tiempo</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-green-900">
                {progress.completedSubmissions}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-orange-600" />
                <div>
                  <p className="font-medium text-orange-900">Entregas Tardías</p>
                  <p className="text-sm text-orange-700">Necesitas mejorar la puntualidad</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-orange-900">
                {progress.lateSubmissions}
              </span>
            </div>

            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="font-medium text-blue-900">Tasa de Completitud</p>
                  <p className="text-sm text-blue-700">Tu rendimiento general</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-blue-900">
                {progress.completionRate}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Entregas Recientes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Mis Entregas Recientes</h3>
        <div className="space-y-4">
          {recentSubmissions.length > 0 ? (
            recentSubmissions.map((submission, index) => {
              const isLate = submission.late
              const isCompleted = submission.status === 'turned_in'
              
              return (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      isCompleted 
                        ? isLate 
                          ? 'bg-orange-100' 
                          : 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      {isCompleted ? (
                        isLate ? (
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        )
                      ) : (
                        <Calendar className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {submission.assignments?.title || 'Tarea sin título'}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {isCompleted 
                          ? `Entregada ${isLate ? '(tardía)' : '(a tiempo)'}`
                          : 'Pendiente de entrega'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-semibold ${
                      isCompleted 
                        ? isLate 
                          ? 'text-orange-600' 
                          : 'text-green-600'
                        : 'text-gray-600'
                    }`}>
                      {isCompleted ? 'Entregada' : 'Pendiente'}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(submission.created_at).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600">No tienes entregas recientes</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
