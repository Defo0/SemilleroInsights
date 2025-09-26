import { useState, useEffect } from 'react'
import { ClassroomService, SyncStatus as SyncStatusType } from '../lib/classroom'
import { dataMode } from '../lib/dataMode'
import { CheckCircle, AlertCircle, Clock, RefreshCw } from 'lucide-react'

export default function SyncStatus() {
  const [syncStatus, setSyncStatus] = useState<SyncStatusType>({ isLoading: false })
  const classroomService = ClassroomService.getInstance()

  useEffect(() => {
    // Actualizar estado inicial
    setSyncStatus(classroomService.getSyncStatus())

    // Polling para actualizar el estado cada 2 segundos
    const interval = setInterval(() => {
      setSyncStatus(classroomService.getSyncStatus())
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  // No mostrar nada en modo mock
  if (dataMode.isMockMode()) {
    return null
  }

  const { isLoading, lastSync, error } = syncStatus

  const formatLastSync = (timestamp?: string) => {
    if (!timestamp) return 'Nunca'
    
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    
    if (diffMins < 1) return 'Hace un momento'
    if (diffMins < 60) return `Hace ${diffMins} minutos`
    
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `Hace ${diffHours} horas`
    
    return date.toLocaleDateString('es-ES')
  }

  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-lg border
      ${error 
        ? 'bg-red-50 border-red-200' 
        : isLoading 
          ? 'bg-blue-50 border-blue-200'
          : 'bg-green-50 border-green-200'
      }
    `}>
      <div className="flex-shrink-0">
        {error ? (
          <AlertCircle className="w-5 h-5 text-red-600" />
        ) : isLoading ? (
          <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
        ) : lastSync ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <Clock className="w-5 h-5 text-gray-600" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${
          error ? 'text-red-800' : isLoading ? 'text-blue-800' : 'text-green-800'
        }`}>
          {error 
            ? 'Error de sincronización'
            : isLoading 
              ? 'Sincronizando con Google Classroom...'
              : 'Sincronizado con Google Classroom'
          }
        </p>
        
        <p className={`text-xs ${
          error ? 'text-red-600' : isLoading ? 'text-blue-600' : 'text-green-600'
        }`}>
          {error 
            ? error
            : `Última sincronización: ${formatLastSync(lastSync)}`
          }
        </p>
      </div>
      
      {error && (
        <button
          onClick={() => classroomService.syncWithClassroom()}
          className="flex-shrink-0 px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
        >
          Reintentar
        </button>
      )}
    </div>
  )
}
