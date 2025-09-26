import { useState } from 'react'
import { ClassroomService } from '../lib/classroom'
import { RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface SyncButtonProps {
  onSyncComplete?: () => void
}

export default function SyncButton({ onSyncComplete }: SyncButtonProps) {
  const [syncing, setSyncing] = useState(false)
  const [lastSync, setLastSync] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  
  const classroomService = ClassroomService.getInstance()

  const handleSync = async () => {
    try {
      setSyncing(true)
      setError(null)
      
      await classroomService.syncWithClassroom()
      
      setLastSync(new Date().toLocaleString('es-ES'))
      onSyncComplete?.()
      
    } catch (error) {
      console.error('Sync error:', error)
      setError(error instanceof Error ? error.message : 'Error desconocido')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={handleSync}
        disabled={syncing}
        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium transition-all ${
          syncing
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : 'bg-primary text-white hover:bg-opacity-90'
        }`}
      >
        <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
        {syncing ? 'Sincronizando...' : 'Sincronizar con Classroom'}
      </button>

      {lastSync && !error && (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <CheckCircle className="w-4 h-4" />
          <span>Última sincronización: {lastSync}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>Error: {error}</span>
        </div>
      )}
    </div>
  )
}
