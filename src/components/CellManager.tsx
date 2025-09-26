import { useState } from 'react'
import { dataMode } from '../lib/dataMode'
import { Users, Settings, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'

interface CellStats {
  cell_id: string
  cell_name: string
  cell_color: string
  student_count: number
  professor_name?: string
  professor_email?: string
}

export default function CellManager() {
  const [isPopulating, setIsPopulating] = useState(false)
  const [populationResult, setPopulationResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  const handlePopulateCells = async () => {
    try {
      setIsPopulating(true)
      setError(null)
      setPopulationResult(null)

      const response = await fetch('/api/populate-cells', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || 'Failed to populate cells')
      }

      const result = await response.json()
      setPopulationResult(result)
      
      // Disparar evento para que otros componentes se actualicen
      window.dispatchEvent(new CustomEvent('cells-updated'))

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsPopulating(false)
    }
  }

  // No mostrar en modo mock
  if (dataMode.isMockMode()) {
    return null
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-purple-100 rounded-lg">
            <Settings className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Gestión de Células</h3>
            <p className="text-sm text-gray-600">
              Organizar estudiantes en células de aprendizaje
            </p>
          </div>
        </div>

        <button
          onClick={handlePopulateCells}
          disabled={isPopulating}
          className="btn-primary flex items-center gap-2"
        >
          <RefreshCw className={`w-4 h-4 ${isPopulating ? 'animate-spin' : ''}`} />
          {isPopulating ? 'Organizando...' : 'Crear Células'}
        </button>
      </div>

      {/* Estado de procesamiento */}
      {isPopulating && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-3">
            <RefreshCw className="w-5 h-5 text-blue-600 animate-spin" />
            <div>
              <p className="font-medium text-blue-800">Organizando estudiantes en células...</p>
              <p className="text-sm text-blue-600">
                Este proceso puede tomar unos momentos dependiendo del número de estudiantes.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Resultado exitoso */}
      {populationResult && !error && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <p className="font-medium text-green-800 mb-2">
                ¡Células creadas exitosamente!
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-green-600 font-medium">Células</p>
                  <p className="text-2xl font-bold text-green-800">
                    {populationResult.stats?.cells || 0}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-green-600 font-medium">Estudiantes</p>
                  <p className="text-2xl font-bold text-green-800">
                    {populationResult.stats?.students || 0}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-green-600 font-medium">Asignaciones</p>
                  <p className="text-2xl font-bold text-green-800">
                    {populationResult.stats?.assignments || 0}
                  </p>
                </div>
                
                <div className="bg-white rounded-lg p-3 border border-green-200">
                  <p className="text-green-600 font-medium">Profesores</p>
                  <p className="text-2xl font-bold text-green-800">
                    {populationResult.stats?.professors || 0}
                  </p>
                </div>
              </div>

              {populationResult.distribution && populationResult.distribution.length > 0 && (
                <div className="mt-4">
                  <p className="font-medium text-green-800 mb-2">Distribución por células:</p>
                  <div className="space-y-2">
                    {populationResult.distribution.map((cell: CellStats, index: number) => (
                      <div key={index} className="flex items-center justify-between bg-white rounded-lg p-2 border border-green-200">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: cell.cell_color }}
                          />
                          <span className="font-medium text-gray-900">{cell.cell_name}</span>
                          {cell.professor_name && (
                            <span className="text-sm text-gray-600">
                              - {cell.professor_name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-green-700">
                          <Users className="w-4 h-4" />
                          <span className="font-medium">{cell.student_count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
            <div>
              <p className="font-medium text-red-800 mb-1">Error al crear células</p>
              <p className="text-sm text-red-600">{error}</p>
              <button
                onClick={() => setError(null)}
                className="mt-2 text-sm text-red-700 hover:text-red-800 underline"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Información */}
      {!populationResult && !isPopulating && !error && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">¿Qué hace esta función?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Crea 3 células temáticas (Frontend, Backend, Data Analytics)</li>
            <li>• Distribuye automáticamente los estudiantes sincronizados de Google Classroom</li>
            <li>• Asigna profesores de práctica a las células</li>
            <li>• Permite el seguimiento personalizado por grupos pequeños</li>
          </ul>
          
          <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Para Demo:</strong> Funciona perfectamente con 1 estudiante y 1 profesor. 
              En producción escalaría automáticamente a 144 estudiantes en 8 células.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
