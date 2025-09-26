import { useState, useEffect } from 'react'
import { ClassroomService } from '../lib/classroom'
import DataModeToggle from './DataModeToggle'
import { 
  Users, 
  BookOpen, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

// Datos de ejemplo para el MVP
const mockData = {
  totalStudents: 144,
  totalCourses: 3,
  totalAssignments: 24,
  completionRate: 78,
  cells: [
    { name: 'Célula A', students: 18, completion: 85, color: '#50c69a' },
    { name: 'Célula B', students: 16, completion: 72, color: '#fa8534' },
    { name: 'Célula C', students: 20, completion: 90, color: '#ed3f70' },
    { name: 'Célula D', students: 17, completion: 68, color: '#2ec69d' },
    { name: 'Célula E', students: 19, completion: 81, color: '#af77f4' },
    { name: 'Célula F', students: 18, completion: 76, color: '#fe7ea1' },
    { name: 'Célula G', students: 16, completion: 83, color: '#fcaf79' },
    { name: 'Célula H', students: 20, completion: 79, color: '#5a25ab' },
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<any>(null)
  const [cellMetrics, setCellMetrics] = useState<any[]>([])
  const [, setRecentAssignments] = useState<any[]>([])
  const [, setWeeklyProgress] = useState<any[]>([])
  const classroomService = ClassroomService.getInstance()

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Cargar métricas del dashboard
      const dashboardMetrics = await classroomService.getDashboardMetrics()
      setMetrics(dashboardMetrics)

      // Cargar métricas por célula
      const cellData = await classroomService.getCellMetrics()
      setCellMetrics(cellData)

      // Cargar tareas recientes
      const assignments = await classroomService.getRecentAssignments(8)
      setRecentAssignments(assignments)

      // Cargar progreso semanal (usando datos mock por ahora)
      setWeeklyProgress(mockData.weeklyProgress)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
      // Fallback a datos mock en caso de error
      setMetrics({
        totalStudents: mockData.totalStudents,
        totalCourses: mockData.totalCourses,
        totalAssignments: mockData.totalAssignments,
        completionRate: mockData.completionRate,
        onTimeSubmissions: 0,
        lateSubmissions: 0,
        missingSubmissions: 0
      })
      setCellMetrics(mockData.cells.map(cell => ({
        cellId: cell.name,
        cellName: cell.name,
        cellColor: cell.color,
        studentCount: cell.students,
        completionRate: cell.completion,
        averageGrade: 0,
        onTimeRate: 0
      })))
      setRecentAssignments(mockData.recentAssignments)
      setWeeklyProgress(mockData.weeklyProgress)
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

  return (
    <div className="space-y-6">
      {/* Data Mode Toggle */}
      <DataModeToggle />
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard General</h1>
          <p className="text-gray-600">Resumen del progreso académico de Semillero Digital</p>
        </div>
        <button
          onClick={loadDashboardData}
          disabled={loading}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Estudiantes</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.totalStudents || 0}</p>
            </div>
            <div className="p-3 bg-accent-green bg-opacity-10 rounded-2xl">
              <Users className="w-6 h-6 text-accent-green" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Cursos Activos</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.totalCourses || 0}</p>
            </div>
            <div className="p-3 bg-accent-orange bg-opacity-10 rounded-2xl">
              <BookOpen className="w-6 h-6 text-accent-orange" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tareas Totales</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.totalAssignments || 0}</p>
            </div>
            <div className="p-3 bg-accent-pink bg-opacity-10 rounded-2xl">
              <CheckCircle className="w-6 h-6 text-accent-pink" />
            </div>
          </div>
        </div>

        <div className="metric-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tasa de Completitud</p>
              <p className="text-2xl font-bold text-gray-900">{metrics?.completionRate || 0}%</p>
            </div>
            <div className="p-3 bg-accent-teal bg-opacity-10 rounded-2xl">
              <TrendingUp className="w-6 h-6 text-accent-teal" />
            </div>
          </div>
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Progreso por Célula */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso por Célula</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={cellMetrics.length > 0 ? cellMetrics : mockData.cells}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={cellMetrics.length > 0 ? "cellName" : "name"} />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Completitud']}
                labelFormatter={(label) => `Célula: ${label}`}
              />
              <Bar 
                dataKey={cellMetrics.length > 0 ? "completionRate" : "completion"} 
                fill="#5a25ab" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Progreso Semanal */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso Semanal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={mockData.weeklyProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="entregas" fill="#fabb2f" name="Entregas" radius={[4, 4, 0, 0]} />
              <Bar dataKey="meta" fill="#50c69a" name="Meta" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tareas Recientes */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Tareas Recientes</h3>
        <div className="space-y-4">
          {mockData.recentAssignments.map((assignment, index) => {
            const completionRate = Math.round((assignment.submissions / assignment.total) * 100)
            const isOverdue = new Date(assignment.dueDate) < new Date()
            
            return (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${isOverdue ? 'bg-red-100' : 'bg-green-100'}`}>
                    {isOverdue ? (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    ) : (
                      <Clock className="w-5 h-5 text-green-600" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{assignment.name}</h4>
                    <p className="text-sm text-gray-600">
                      Vence: {new Date(assignment.dueDate).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">{completionRate}%</p>
                  <p className="text-sm text-gray-600">
                    {assignment.submissions}/{assignment.total} entregas
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Distribución de Células */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Estudiantes por Célula</h3>
        <div className="flex flex-col lg:flex-row items-center gap-8">
          <div className="w-full lg:w-1/2">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={mockData.cells}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                  label={({ name, students }) => `${name}: ${students}`}
                >
                  {mockData.cells.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-2">
            {mockData.cells.map((cell, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="w-4 h-4 rounded-full" 
                  style={{ backgroundColor: cell.color }}
                />
                <span className="text-sm text-gray-700 flex-1">{cell.name}</span>
                <span className="text-sm font-medium text-gray-900">
                  {cell.students} estudiantes
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
