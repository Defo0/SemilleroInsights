import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { LogIn, BookOpen, Users, BarChart3 } from 'lucide-react'

export default function Login() {
  const [loading, setLoading] = useState(false)

  const handleGoogleLogin = async () => {
    try {
      setLoading(true)
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          scopes: 'https://www.googleapis.com/auth/classroom.courses.readonly https://www.googleapis.com/auth/classroom.rosters.readonly https://www.googleapis.com/auth/classroom.coursework.students.readonly',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) {
        console.error('Error during authentication:', error.message)
        alert('Error al iniciar sesión: ' + error.message)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('Error inesperado al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo y Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-2xl mb-4">
            <BarChart3 className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Semillero Insights
          </h1>
          <p className="text-gray-600">
            Dashboard inteligente para Google Classroom
          </p>
        </div>

        {/* Card de Login */}
        <div className="card">
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Iniciar Sesión
            </h2>
            <p className="text-gray-600 text-sm">
              Conecta con tu cuenta de Google para acceder a tus datos de Classroom
            </p>
          </div>

          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full btn-primary flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
              <LogIn className="w-5 h-5" />
            )}
            {loading ? 'Conectando...' : 'Continuar con Google'}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-4">
              Al iniciar sesión, autorizas el acceso a:
            </p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BookOpen className="w-4 h-4 text-accent-green" />
                <span>Cursos de Google Classroom</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4 text-accent-orange" />
                <span>Lista de estudiantes y profesores</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <BarChart3 className="w-4 h-4 text-accent-pink" />
                <span>Tareas y estados de entrega</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-500">
            Una herramienta de{' '}
            <span className="font-semibold text-primary">Semillero Digital</span>
          </p>
        </div>
      </div>
    </div>
  )
}
