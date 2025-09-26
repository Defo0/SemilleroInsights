import { useEffect } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Supabase maneja automáticamente el callback
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error en callback:', error)
          window.location.href = '/?error=auth_failed'
          return
        }

        if (data.session) {
          // Redirigir a la aplicación principal
          window.location.href = '/'
        } else {
          // Si no hay sesión, redirigir al login
          window.location.href = '/?error=no_session'
        }
      } catch (error) {
        console.error('Error inesperado en callback:', error)
        window.location.href = '/?error=unexpected'
      }
    }

    handleAuthCallback()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Completando autenticación...
        </h2>
        <p className="text-gray-600">
          Te redirigiremos en un momento
        </p>
      </div>
    </div>
  )
}
