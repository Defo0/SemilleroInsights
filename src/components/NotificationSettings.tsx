import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { 
  Bell, 
  Mail, 
  MessageCircle, 
  Send, 
  Check, 
  X,
  Settings,
  Save
} from 'lucide-react'

interface NotificationPreferences {
  emailEnabled: boolean
  discordEnabled: boolean
  telegramEnabled: boolean
  discordId?: string
  telegramId?: string
}

export default function NotificationSettings() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    emailEnabled: true,
    discordEnabled: false,
    telegramEnabled: false
  })
  const [testResults, setTestResults] = useState<{
    email?: boolean
    discord?: boolean
    telegram?: boolean
  }>({})

  useEffect(() => {
    loadPreferences()
  }, [])

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (error && error.code !== 'PGRST116') {
        console.error('Error loading preferences:', error)
        return
      }

      if (data) {
        setPreferences({
          emailEnabled: data.email_enabled,
          discordEnabled: data.discord_enabled,
          telegramEnabled: data.telegram_enabled,
          discordId: data.discord_id || '',
          telegramId: data.telegram_id || ''
        })
      }
    } catch (error) {
      console.error('Error loading preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: user.id,
          email_enabled: preferences.emailEnabled,
          discord_enabled: preferences.discordEnabled,
          telegram_enabled: preferences.telegramEnabled,
          discord_id: preferences.discordId || null,
          telegram_id: preferences.telegramId || null
        })

      if (error) {
        console.error('Error saving preferences:', error)
        alert('Error al guardar preferencias')
        return
      }

      alert('Preferencias guardadas exitosamente')
    } catch (error) {
      console.error('Error saving preferences:', error)
      alert('Error al guardar preferencias')
    } finally {
      setSaving(false)
    }
  }

  const testNotification = async (type: 'email' | 'discord' | 'telegram') => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const response = await fetch('/api/send-notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        },
        body: JSON.stringify({
          type: 'announcement',
          title: 'Prueba de Notificación',
          message: `Esta es una prueba de notificación por ${type}. Si recibes este mensaje, la configuración está funcionando correctamente.`,
          recipients: [{
            userId: user.id,
            email: user.email!,
            name: user.user_metadata?.full_name || user.email!,
            role: 'professor', // Asumimos profesor para la prueba
            preferences: {
              email: type === 'email',
              discord: type === 'discord',
              telegram: type === 'telegram',
              discordId: preferences.discordId,
              telegramId: preferences.telegramId
            }
          }]
        })
      })

      const result = await response.json()
      
      setTestResults(prev => ({
        ...prev,
        [type]: response.ok && result.results[type] === 'success'
      }))

      if (response.ok && result.results[type] === 'success') {
        alert(`Notificación de prueba enviada por ${type}`)
      } else {
        alert(`Error al enviar notificación por ${type}: ${result.errors?.join(', ') || 'Error desconocido'}`)
      }
    } catch (error) {
      console.error(`Error testing ${type} notification:`, error)
      setTestResults(prev => ({ ...prev, [type]: false }))
      alert(`Error al probar notificación por ${type}`)
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
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-6 h-6 text-primary" />
          <h1 className="text-2xl font-bold text-gray-900">Configuración de Notificaciones</h1>
        </div>
        <p className="text-gray-600">
          Configura cómo y cuándo quieres recibir notificaciones del sistema
        </p>
      </div>

      {/* Email Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Mail className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notificaciones por Email</h3>
              <p className="text-sm text-gray-600">Recibe notificaciones en tu correo electrónico</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {testResults.email !== undefined && (
              <div className={`p-1 rounded-full ${testResults.email ? 'bg-green-100' : 'bg-red-100'}`}>
                {testResults.email ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-red-600" />
                )}
              </div>
            )}
            <button
              onClick={() => testNotification('email')}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Probar
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.emailEnabled}
                onChange={(e) => setPreferences(prev => ({ ...prev, emailEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Discord Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 rounded-lg">
              <MessageCircle className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notificaciones por Discord</h3>
              <p className="text-sm text-gray-600">Recibe notificaciones en Discord</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {testResults.discord !== undefined && (
              <div className={`p-1 rounded-full ${testResults.discord ? 'bg-green-100' : 'bg-red-100'}`}>
                {testResults.discord ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-red-600" />
                )}
              </div>
            )}
            <button
              onClick={() => testNotification('discord')}
              disabled={!preferences.discordEnabled || !preferences.discordId}
              className="text-sm text-primary hover:text-primary-dark disabled:text-gray-400"
            >
              Probar
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.discordEnabled}
                onChange={(e) => setPreferences(prev => ({ ...prev, discordEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        {preferences.discordEnabled && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Discord User ID (opcional)
            </label>
            <input
              type="text"
              value={preferences.discordId || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, discordId: e.target.value }))}
              placeholder="123456789012345678"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Para recibir menciones directas. Puedes obtener tu ID habilitando el modo desarrollador en Discord.
            </p>
          </div>
        )}
      </div>

      {/* Telegram Settings */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Send className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Notificaciones por Telegram</h3>
              <p className="text-sm text-gray-600">Recibe notificaciones en Telegram</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {testResults.telegram !== undefined && (
              <div className={`p-1 rounded-full ${testResults.telegram ? 'bg-green-100' : 'bg-red-100'}`}>
                {testResults.telegram ? (
                  <Check className="w-4 h-4 text-green-600" />
                ) : (
                  <X className="w-4 h-4 text-red-600" />
                )}
              </div>
            )}
            <button
              onClick={() => testNotification('telegram')}
              disabled={!preferences.telegramEnabled || !preferences.telegramId}
              className="text-sm text-primary hover:text-primary-dark disabled:text-gray-400"
            >
              Probar
            </button>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.telegramEnabled}
                onChange={(e) => setPreferences(prev => ({ ...prev, telegramEnabled: e.target.checked }))}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
        {preferences.telegramEnabled && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Telegram Chat ID
            </label>
            <input
              type="text"
              value={preferences.telegramId || ''}
              onChange={(e) => setPreferences(prev => ({ ...prev, telegramId: e.target.value }))}
              placeholder="123456789"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            />
            <p className="text-xs text-gray-500 mt-1">
              Envía /start al bot @SemilleroInsightsBot para obtener tu Chat ID.
            </p>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={savePreferences}
          disabled={saving}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Guardando...' : 'Guardar Preferencias'}
        </button>
      </div>

      {/* Info Card */}
      <div className="card bg-blue-50 border-blue-200">
        <div className="flex items-start gap-3">
          <Bell className="w-5 h-5 text-blue-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-900 mb-2">Tipos de Notificaciones</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Nuevas entregas:</strong> Cuando un estudiante entrega una tarea</li>
              <li>• <strong>Tareas próximas a vencer:</strong> Recordatorios de fechas límite</li>
              <li>• <strong>Calificaciones asignadas:</strong> Cuando se asigna una calificación</li>
              <li>• <strong>Anuncios:</strong> Comunicados importantes del sistema</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
