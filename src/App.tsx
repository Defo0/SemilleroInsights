import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { Session } from '@supabase/supabase-js'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import ProfessorDashboard from './components/ProfessorDashboard'
import NotificationSettings from './components/NotificationSettings'
import Layout from './components/Layout'
import { User } from './types'

function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Obtener sesión inicial
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) {
        loadUserProfile(session.user.id)
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
        loadUserProfile(session.user.id)
      } else {
        setUser(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading user profile:', error)
      }

      setUser(data)
    } catch (error) {
      console.error('Error loading user profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Login />
  }

  // Si el usuario no tiene perfil en la base de datos, mostrar mensaje
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card max-w-md text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Perfil no encontrado
          </h2>
          <p className="text-gray-600 mb-6">
            Tu cuenta no está registrada en el sistema. Contacta al administrador para obtener acceso.
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
    <Router>
      <Layout session={session} user={user}>
        <Routes>
          <Route 
            path="/" 
            element={
              user.role === 'coordinator' ? <Dashboard /> : <ProfessorDashboard />
            } 
          />
          <Route 
            path="/coordinator" 
            element={
              user.role === 'coordinator' ? (
                <Dashboard />
              ) : (
                <div className="card text-center py-12">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Acceso Denegado</h3>
                  <p className="text-gray-600">No tienes permisos para acceder a esta sección.</p>
                </div>
              )
            } 
          />
          <Route 
            path="/professor" 
            element={<ProfessorDashboard />} 
          />
          <Route 
            path="/notifications" 
            element={<NotificationSettings />} 
          />
        </Routes>
      </Layout>
    </Router>
  )
}

export default App
