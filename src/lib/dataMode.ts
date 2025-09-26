// Sistema para alternar entre datos mock y datos reales
export type DataMode = 'mock' | 'real'

// Por defecto usar datos mock para desarrollo/demo
const DEFAULT_MODE: DataMode = 'mock'

export class DataModeManager {
  private static instance: DataModeManager
  private currentMode: DataMode

  private constructor() {
    // Leer del localStorage o usar default
    const savedMode = localStorage.getItem('semillero-data-mode') as DataMode
    this.currentMode = savedMode || DEFAULT_MODE
  }

  static getInstance(): DataModeManager {
    if (!DataModeManager.instance) {
      DataModeManager.instance = new DataModeManager()
    }
    return DataModeManager.instance
  }

  getCurrentMode(): DataMode {
    return this.currentMode
  }

  setMode(mode: DataMode): void {
    this.currentMode = mode
    localStorage.setItem('semillero-data-mode', mode)
    
    // Disparar evento para que los componentes se actualicen
    window.dispatchEvent(new CustomEvent('datamode-changed', { 
      detail: { mode } 
    }))
  }

  isMockMode(): boolean {
    return this.currentMode === 'mock'
  }

  isRealMode(): boolean {
    return this.currentMode === 'real'
  }
}

export const dataMode = DataModeManager.getInstance()
