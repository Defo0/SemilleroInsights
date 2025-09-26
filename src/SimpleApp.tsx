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
      await loadDataForRole(user.role, user.email)
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
              <p className="text-sm text-gray-600">
                {user.role === 'coordinator' && 'Vista de Coordinador'}
                {user.role === 'professor' && 'Vista de Profesor'}
                {user.role === 'student' && 'Mi Progreso'}
              </p>
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
            {user.role === 'coordinator' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Métricas Globales</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Total Cursos</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.totalCourses}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Total Estudiantes</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.totalStudents}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Total Tareas</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.totalAssignments}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">% Completitud</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.completionRate}%</p>
                  </div>
                </div>
                
                <div className="card">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Cursos Activos</h3>
                  <div className="space-y-3">
                    {data.courses.map((course: any) => (
                      <div key={course.id} className="p-4 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">{course.name}</h4>
                        {course.section && (
                          <p className="text-sm text-gray-600">{course.section}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Vista de Profesor */}
            {user.role === 'professor' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mis Cursos</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Mis Cursos</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.courses.length}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Mis Estudiantes</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.totalStudents}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Tareas Creadas</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.totalAssignments}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {data.courses.map((course: any) => (
                    <div key={course.id} className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{course.name}</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Estudiantes ({course.studentCount})</h4>
                          <div className="space-y-2">
                            {course.students.slice(0, 5).map((student: any) => (
                              <div key={student.userId} className="text-sm text-gray-600">
                                {student.profile?.name?.fullName || 'Estudiante'}
                              </div>
                            ))}
                            {course.studentCount > 5 && (
                              <div className="text-sm text-gray-500">
                                +{course.studentCount - 5} más...
                              </div>
                            )}
                          </div>
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Tareas ({course.assignmentCount})</h4>
                          <div className="space-y-2">
                            {course.assignments.slice(0, 3).map((assignment: any) => (
                              <div key={assignment.id} className="text-sm text-gray-600">
                                {assignment.title}
                              </div>
                            ))}
                            {course.assignmentCount > 3 && (
                              <div className="text-sm text-gray-500">
                                +{course.assignmentCount - 3} más...
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Vista de Estudiante */}
            {user.role === 'student' && (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Mi Progreso</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Mis Cursos</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.courses.length}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Tareas Totales</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.totalAssignments}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">Completadas</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.completedAssignments}</p>
                  </div>
                  <div className="metric-card">
                    <h3 className="text-sm font-medium text-gray-600">% Completitud</h3>
                    <p className="text-2xl font-bold text-gray-900">{data.completionRate}%</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {data.courses.map((course: any) => (
                    <div key={course.id} className="card">
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">{course.name}</h3>
                      <div>
                        <h4 className="font-medium text-gray-700 mb-2">Mis Tareas</h4>
                        <div className="space-y-2">
                          {course.assignments.map((assignment: any) => (
                            <div key={assignment.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                              <div>
                                <p className="font-medium text-gray-900">{assignment.title}</p>
                                {assignment.dueDate && (
                                  <p className="text-sm text-gray-600">Vence: {assignment.dueDate}</p>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
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
