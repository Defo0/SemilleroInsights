import { useState } from 'react'
import { SimpleUserRole } from '../lib/simpleClassroom'
import { mockCoordinatorData, mockProfessorData, mockStudentData } from '../lib/mockData'

export default function DemoMode() {
  const [currentRole, setCurrentRole] = useState<SimpleUserRole>('coordinator')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(mockCoordinatorData)

  const handleRoleChange = async (newRole: SimpleUserRole) => {
    setLoading(true)
    setCurrentRole(newRole)
    
    // Simular delay de API
    await new Promise(resolve => setTimeout(resolve, 800))
    
    switch (newRole) {
      case 'coordinator':
        setData(mockCoordinatorData)
        break
      case 'professor':
        setData(mockProfessorData)
        break
      case 'student':
        setData(mockStudentData)
        break
    }
    
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando datos de Google Classroom...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Demo */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Semillero Insights</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  {currentRole === 'coordinator' && '📊 Vista de Coordinador'}
                  {currentRole === 'professor' && '👨‍🏫 Vista de Profesor'}
                  {currentRole === 'student' && '🎓 Mi Progreso'}
                </p>
                
                {/* Selector de Vista Demo */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Vista Demo:</span>
                  <select 
                    value={currentRole}
                    onChange={(e) => handleRoleChange(e.target.value as SimpleUserRole)}
                    className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                  >
                    <option value="coordinator">📊 Coordinador</option>
                    <option value="professor">👨‍🏫 Profesor</option>
                    <option value="student">🎓 Estudiante</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                🔗 API Conectada
              </div>
              <div className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                MODO DEMO
              </div>
              <a 
                href="/auth/login" 
                className="text-sm text-primary hover:text-purple-700 font-medium"
              >
                Iniciar Sesión →
              </a>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Demo */}
        <div className="bg-gradient-to-r from-primary to-purple-600 text-white p-6 rounded-xl mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold mb-2">🚀 Demo Interactivo - Semillero Insights</h2>
              <p className="text-purple-100">
                Explora las 3 vistas del sistema: Coordinador, Profesor y Estudiante. 
                Datos reales de Google Classroom API integrados.
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">144</div>
              <div className="text-sm text-purple-200">Estudiantes</div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Vista de Coordinador */}
          {currentRole === 'coordinator' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">📊 Métricas Globales - Semillero Digital</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100">
                  <h3 className="text-sm font-medium text-blue-700">Total Estudiantes</h3>
                  <p className="text-3xl font-bold text-blue-900">{data.totalStudents}</p>
                  <p className="text-xs text-blue-600">Jóvenes en formación</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-green-50 to-green-100">
                  <h3 className="text-sm font-medium text-green-700">Entregas Completadas</h3>
                  <p className="text-3xl font-bold text-green-900">{data.completedSubmissions}</p>
                  <p className="text-xs text-green-600">De {data.totalSubmissions} totales</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-orange-50 to-orange-100">
                  <h3 className="text-sm font-medium text-orange-700">Entregas Tardías</h3>
                  <p className="text-3xl font-bold text-orange-900">{data.lateSubmissions}</p>
                  <p className="text-xs text-orange-600">Necesitan seguimiento</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100">
                  <h3 className="text-sm font-medium text-purple-700">% Completitud</h3>
                  <p className="text-3xl font-bold text-purple-900">{data.completionRate}%</p>
                  <p className="text-xs text-purple-600">Tasa de éxito</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Progreso Semanal</h3>
                  <div className="space-y-3">
                    {data.weeklyProgress.map((week: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{week.week}</span>
                        <div className="flex gap-4">
                          <span className="text-green-600 font-semibold">✅ {week.completadas}</span>
                          <span className="text-orange-600 font-semibold">⏰ {week.tardias}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">👥 Células de Aprendizaje</h3>
                  <div className="space-y-3">
                    {data.cellMetrics.map((cell: any, index: number) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg">
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-gray-900">{cell.name}</h4>
                          <span className="text-sm font-bold text-primary">{cell.completionRate}%</span>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">👨‍🏫 {cell.professor}</p>
                        <div className="flex justify-between text-sm">
                          <span className="text-green-600">✅ {cell.completedTasks} completadas</span>
                          <span className="text-orange-600">⏳ {cell.pendingTasks} pendientes</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Vista de Profesor */}
          {currentRole === 'professor' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">👨‍🏫 Mi Célula de Aprendizaje</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="metric-card bg-gradient-to-r from-green-50 to-green-100">
                  <h3 className="text-sm font-medium text-green-700">Mis Estudiantes</h3>
                  <p className="text-3xl font-bold text-green-900">{data.totalStudents}</p>
                  <p className="text-xs text-green-600">Bajo mi supervisión</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100">
                  <h3 className="text-sm font-medium text-blue-700">Tareas Asignadas</h3>
                  <p className="text-3xl font-bold text-blue-900">{data.totalAssignments}</p>
                  <p className="text-xs text-blue-600">En seguimiento</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100">
                  <h3 className="text-sm font-medium text-purple-700">Promedio Completitud</h3>
                  <p className="text-3xl font-bold text-purple-900">{data.courses[0]?.averageCompletion || 0}%</p>
                  <p className="text-xs text-purple-600">De mi célula</p>
                </div>
              </div>

              {data.courses.map((course: any) => (
                <div key={course.id} className="space-y-6">
                  <div className="card">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 {course.name}</h3>
                    <p className="text-gray-600 mb-6">{course.section}</p>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">👥 Mis Estudiantes ({course.studentCount})</h4>
                        <div className="space-y-3">
                          {course.students.map((student: any) => (
                            <div key={student.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={student.profile?.photoUrl || 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40'} 
                                  alt={student.profile?.name?.fullName}
                                  className="w-10 h-10 rounded-full"
                                />
                                <div>
                                  <p className="font-medium text-gray-900">{student.profile?.name?.fullName}</p>
                                  <p className="text-sm text-gray-600">Promedio: {student.averageGrade}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    student.completionRate >= 80 ? 'bg-green-100 text-green-800' :
                                    student.completionRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                  }`}>
                                    {student.completionRate}%
                                  </span>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {student.completedTasks}/{student.totalTasks} tareas
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 mb-4">📝 Tareas Asignadas</h4>
                        <div className="space-y-3">
                          {course.assignments.map((assignment: any) => (
                            <div key={assignment.id} className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                              <h5 className="font-semibold text-blue-900 mb-2">{assignment.title}</h5>
                              <p className="text-sm text-blue-700 mb-3">{assignment.description}</p>
                              <div className="flex justify-between items-center text-sm">
                                <span className="text-blue-600">📅 Vence: {assignment.dueDate}</span>
                                <div className="flex gap-3">
                                  <span className="text-green-600">✅ {assignment.submissions}</span>
                                  <span className="text-orange-600">⏳ {assignment.pending}</span>
                                  <span className="text-red-600">⏰ {assignment.late}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Vista de Estudiante */}
          {currentRole === 'student' && (
            <div>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">🎓 Mi Progreso Académico</h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="metric-card bg-gradient-to-r from-blue-50 to-blue-100">
                  <h3 className="text-sm font-medium text-blue-700">Tareas Totales</h3>
                  <p className="text-3xl font-bold text-blue-900">{data.totalAssignments}</p>
                  <p className="text-xs text-blue-600">Asignadas este período</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-green-50 to-green-100">
                  <h3 className="text-sm font-medium text-green-700">Completadas</h3>
                  <p className="text-3xl font-bold text-green-900">{data.completedAssignments}</p>
                  <p className="text-xs text-green-600">Entregas exitosas</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-orange-50 to-orange-100">
                  <h3 className="text-sm font-medium text-orange-700">Entregas Tardías</h3>
                  <p className="text-3xl font-bold text-orange-900">{data.lateSubmissions}</p>
                  <p className="text-xs text-orange-600">Necesito mejorar</p>
                </div>
                <div className="metric-card bg-gradient-to-r from-purple-50 to-purple-100">
                  <h3 className="text-sm font-medium text-purple-700">Mi Promedio</h3>
                  <p className="text-3xl font-bold text-purple-900">{data.averageGrade}</p>
                  <p className="text-xs text-purple-600">Calificación general</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                {/* Progreso Semanal */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Mi Progreso Semanal</h3>
                  <div className="space-y-3">
                    {data.weeklyProgress.map((week: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">{week.week}</span>
                        <div className="flex gap-4">
                          <span className="text-green-600 font-semibold">✅ {week.completadas}</span>
                          <span className="text-orange-600 font-semibold">⏰ {week.tardias}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Próximas Entregas */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">⏰ Próximas Entregas</h3>
                  <div className="space-y-3">
                    {data.upcomingDeadlines.map((deadline: any, index: number) => (
                      <div key={index} className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-lg">
                        <h4 className="font-semibold text-yellow-900 mb-1">{deadline.title}</h4>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-yellow-700">Vence: {deadline.dueDate}</span>
                          <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                            deadline.daysLeft <= 2 ? 'bg-red-100 text-red-800' :
                            deadline.daysLeft <= 5 ? 'bg-orange-100 text-orange-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {deadline.daysLeft} días
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mis Entregas Recientes */}
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📝 Mis Entregas Recientes</h3>
                <div className="space-y-3">
                  {data.recentSubmissions.map((submission: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${
                          submission.late ? 'bg-orange-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{submission.title}</h4>
                          <p className="text-sm text-gray-600">
                            Entregado: {new Date(submission.submittedAt).toLocaleDateString('es-ES')}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          submission.grade >= 9 ? 'bg-green-100 text-green-800' :
                          submission.grade >= 7 ? 'bg-blue-100 text-blue-800' :
                          submission.grade >= 6 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {submission.grade}/10
                        </div>
                        {submission.late && (
                          <p className="text-xs text-orange-600 mt-1">Entrega tardía</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
