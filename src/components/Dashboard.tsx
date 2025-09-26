import { useState, useEffect } from 'react'
import { DataService, type DashboardMetrics } from '../lib/dataService'
import { dataMode } from '../lib/dataMode'
import DataModeToggle from './DataModeToggle'
import SyncStatus from './SyncStatus'
import CellManager from './CellManager'
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

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    loadDashboardData()
    
    // Escuchar cambios en el modo de datos
    const handleModeChange = () => {
      loadDashboardData()
    }
    
    // Escuchar actualizaciones de células
    const handleCellsUpdate = () => {
      loadDashboardData()
    }
    
    window.addEventListener('datamode-changed', handleModeChange)
    window.addEventListener('cells-updated', handleCellsUpdate)
    return () => {
      window.removeEventListener('datamode-changed', handleModeChange)
      window.removeEventListener('cells-updated', handleCellsUpdate)
    }
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)
      
      // Usar el nuevo DataService
      const dashboardMetrics = await DataService.getDashboardMetrics()
      setMetrics(dashboardMetrics)

    } catch (error) {
      console.error('Error loading dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await DataService.refreshData()
    await loadDashboardData()
    setRefreshing(false)
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
      
      {/* Sync Status */}
      <SyncStatus />
      
      {/* Cell Manager */}
      <CellManager />
      
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard General</h1>
          <p className="text-gray-600">
            Resumen del progreso académico de Semillero Digital
            <span className={`ml-2 px-2 py-1 text-xs rounded-full ${
              dataMode.isMockMode() 
                ? 'bg-orange-100 text-orange-800' 
                : 'bg-green-100 text-green-800'
            }`}>
              {dataMode.isMockMode() ? 'Modo Demo' : 'Datos Reales'}
            </span>
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading || refreshing}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${(loading || refreshing) ? 'animate-spin' : ''}`} />
          {(loading || refreshing) ? 'Actualizando...' : 'Actualizar Dashboard'}
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
            <BarChart data={metrics?.cells || []}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip 
                formatter={(value) => [`${value}%`, 'Completitud']}
                labelFormatter={(label) => `Célula: ${label}`}
              />
              <Bar 
                dataKey="completion" 
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
            <BarChart data={metrics?.weeklyProgress || []}>
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
          {(metrics?.recentAssignments || []).map((assignment, index) => {
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
                  data={metrics?.cells || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="students"
                  label={({ name, students }) => `${name}: ${students}`}
                >
                  {(metrics?.cells || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="w-full lg:w-1/2 space-y-2">
            {(metrics?.cells || []).map((cell, index) => (
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
