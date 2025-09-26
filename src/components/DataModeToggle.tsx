import { useState, useEffect } from 'react'
import { dataMode, DataMode } from '../lib/dataMode'
import { Database, TestTube, RefreshCw } from 'lucide-react'

export default function DataModeToggle() {
  const [currentMode, setCurrentMode] = useState<DataMode>(dataMode.getCurrentMode())
  const [isChanging, setIsChanging] = useState(false)

  useEffect(() => {
    const handleModeChange = (event: CustomEvent) => {
      setCurrentMode(event.detail.mode)
    }

    window.addEventListener('datamode-changed', handleModeChange as EventListener)
    return () => {
      window.removeEventListener('datamode-changed', handleModeChange as EventListener)
    }
  }, [])

  const handleToggle = async () => {
    setIsChanging(true)
    
    const newMode: DataMode = currentMode === 'mock' ? 'real' : 'mock'
    dataMode.setMode(newMode)
    
    // Simular un pequeño delay para mostrar el loading
    setTimeout(() => {
      setIsChanging(false)
    }, 500)
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <img 
              src="/thumbnail_sin_fondo.png" 
              alt="Semillero Digital Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          {currentMode === 'mock' ? (
            <TestTube className="w-5 h-5 text-accent-orange" />
          ) : (
            <Database className="w-5 h-5 text-accent-green" />
          )}
          <div>
            <h3 className="font-medium text-gray-900">
              Modo de Datos: {currentMode === 'mock' ? 'Demostración' : 'Tiempo Real'}
            </h3>
            <p className="text-sm text-gray-600">
              {currentMode === 'mock' 
                ? 'Mostrando datos de ejemplo para demostración'
                : 'Sincronizado con Google Classroom en tiempo real'
              }
            </p>
          </div>
        </div>
        
        <button
          onClick={handleToggle}
          disabled={isChanging}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all
            ${currentMode === 'mock' 
              ? 'bg-accent-green text-white hover:bg-green-600' 
              : 'bg-accent-orange text-white hover:bg-orange-600'
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
        >
          {isChanging ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : currentMode === 'mock' ? (
            <Database className="w-4 h-4" />
          ) : (
            <TestTube className="w-4 h-4" />
          )}
          {isChanging 
            ? 'Cambiando...' 
            : currentMode === 'mock' 
              ? 'Usar Datos Reales' 
              : 'Usar Datos Demo'
          }
        </button>
      </div>
      
      {currentMode === 'real' && (
        <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Nota:</strong> Los datos reales requieren permisos de Google Classroom. 
            Asegúrate de haber autorizado el acceso correctamente.
          </p>
        </div>
      )}
    </div>
  )
}
