import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import { SimpleClassroomService, SimpleUser, SimpleUserRole } from './lib/simpleClassroom'
import Login from './components/Login'
import AuthCallback from './components/AuthCallback'

function SimpleApp() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<SimpleUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<any>(null)
  const [demoRole, setDemoRole] = useState<SimpleUserRole | null>(null) // Para selector de demo

  const classroomService = SimpleClassroomService.getInstance()

  // Verificar si estamos en la ruta de callback
  const isCallbackRoute = window.location.pathname === '/auth/callback'

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        initializeUser(session)
      } else {
        setLoading(false)
      }
    })

    // Escuchar cambios en la autenticación
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) {
        initializeUser(session)
      } else {
        setUser(null)
        setData(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const initializeUser = async (session: Session) => {
    try {
      setLoading(true)

      // Configurar token de acceso
      const accessToken = session.provider_token
      if (!accessToken) {
        throw new Error('No access token available')
      }

      classroomService.setAccessToken(accessToken)

      // Crear usuario simple
      const email = session.user.email || ''
      const name = session.user.user_metadata?.full_name || email
      
      // Detectar rol desde Classroom
      const role = await classroomService.detectUserRole(email)

      const simpleUser: SimpleUser = {
        email,
        name,
        role,
        avatar: session.user.user_metadata?.avatar_url
      }

      setUser(simpleUser)

      // Cargar datos según el rol
      await loadDataForRole(role, email)

    } catch (error) {
      console.error('Error initializing user:', error)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const loadDataForRole = async (role: SimpleUserRole, email: string) => {
    try {
      let roleData

      switch (role) {
        case 'coordinator':
          roleData = await classroomService.getCoordinatorData()
          break
        case 'professor':
          roleData = await classroomService.getProfessorData(email)
          break
        case 'student':
          roleData = await classroomService.getStudentData(email)
          break
        default:
          roleData = null
      }

      setData(roleData)
    } catch (error) {
      console.error('Error loading role data:', error)
      setData(null)
    }
  }

  const handleRefresh = async () => {
    if (user) {
      setLoading(true)
      const currentRole = demoRole || user.role
      await loadDataForRole(currentRole, user.email)
      setLoading(false)
    }
  }

  const handleRoleChange = async (newRole: SimpleUserRole) => {
    if (user) {
      setDemoRole(newRole)
      setLoading(true)
      await loadDataForRole(newRole, user.email)
      setLoading(false)
    }
  }

  // Si estamos en la ruta de callback, mostrar el componente de callback
  if (isCallbackRoute) {
    return <AuthCallback />
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

  if (!session) {
    return <Login />
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Error de acceso
          </h2>
          <p className="text-gray-600 mb-6">
            No se pudo acceder a Google Classroom. Verifica que tengas los permisos necesarios.
          </p>
          <button
            onClick={() => supabase.auth.signOut()}
            className="btn-primary"
          >
            Cerrar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simple */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Semillero Insights</h1>
              <div className="flex items-center gap-4">
                <p className="text-sm text-gray-600">
                  {(demoRole || user.role) === 'coordinator' && '📊 Vista de Coordinador'}
                  {(demoRole || user.role) === 'professor' && '👨‍🏫 Vista de Profesor'}
                  {(demoRole || user.role) === 'student' && '🎓 Mi Progreso'}
                </p>
                
                {/* Selector de Vista Demo */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">Vista Demo:</span>
                  <select 
                    value={demoRole || user.role}
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
              <button
                onClick={handleRefresh}
                disabled={loading}
                className="btn-secondary"
              >
                {loading ? 'Cargando...' : 'Actualizar'}
              </button>
              <div className="flex items-center gap-2">
                {user.avatar && (
                  <img 
                    src={user.avatar} 
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                )}
                <span className="text-sm font-medium text-gray-700">{user.name}</span>
              </div>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {data ? (
          <div className="space-y-6">
            {/* Vista de Coordinador */}
            {(demoRole || user.role) === 'coordinator' && (
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
                
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">🎓 Cursos Activos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {data.courses.map((course: any) => (
                      <div key={course.id} className="p-4 bg-gradient-to-br from-primary to-purple-600 text-white rounded-xl">
                        <h4 className="font-bold text-lg mb-2">{course.name}</h4>
                        <p className="text-purple-100 text-sm mb-3">{course.section}</p>
                        <div className="flex justify-between text-sm">
                          <span>👥 {course.studentCount} estudiantes</span>
                          <span>📝 {course.assignmentCount} tareas</span>
                        </div>
                        <div className="mt-2 bg-white bg-opacity-20 rounded-full h-2">
                          <div 
                            className="bg-yellow-300 h-2 rounded-full" 
                            style={{ width: `${course.completionRate}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vista de Profesor */}
            {(demoRole || user.role) === 'professor' && (
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

                    {/* Actividad Reciente */}
                    <div className="card">
                      <h4 className="font-semibold text-gray-800 mb-4">🔔 Actividad Reciente</h4>
                      <div className="space-y-3">
                        {data.recentActivity.map((activity: any, index: number) => (
                          <div key={index} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                            <div className={`w-3 h-3 rounded-full ${
                              activity.status === 'completed' ? 'bg-green-500' :
                              activity.status === 'late' ? 'bg-red-500' : 'bg-blue-500'
                            }`}></div>
                            <div className="flex-1">
                              <p className="font-medium text-gray-900">{activity.student}</p>
                              <p className="text-sm text-gray-600">{activity.action}: {activity.assignment}</p>
                            </div>
                            <span className="text-xs text-gray-500">{activity.time}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Vista de Estudiante */}
            {(demoRole || user.role) === 'student' && (
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

                {/* Mis Cursos */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📚 Mis Cursos</h3>
                  <div className="space-y-4">
                    {data.courses.map((course: any) => (
                      <div key={course.id} className="p-4 bg-gradient-to-r from-primary to-purple-600 text-white rounded-xl">
                        <h4 className="font-bold text-lg mb-2">{course.name}</h4>
                        <p className="text-purple-100 text-sm mb-3">{course.section}</p>
                        <div className="space-y-2">
                          {course.assignments.map((assignment: any) => (
                            <div key={assignment.id} className="flex justify-between items-center p-2 bg-white bg-opacity-20 rounded-lg">
                              <span className="text-sm">{assignment.title}</span>
                              <div className="flex items-center gap-2">
                                {assignment.status === 'turned_in' ? (
                                  <span className="text-xs bg-green-400 px-2 py-1 rounded-full">
                                    ✅ {assignment.grade}/10
                                  </span>
                                ) : (
                                  <span className="text-xs bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full">
                                    ⏳ Pendiente
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="card text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No se pudieron cargar los datos
            </h3>
            <p className="text-gray-600 mb-4">
              Verifica que tengas acceso a Google Classroom y los permisos necesarios.
            </p>
            <button onClick={handleRefresh} className="btn-primary">
              Intentar de nuevo
            </button>
          </div>
        )}
      </main>
    </div>
  )
}

export default SimpleApp
