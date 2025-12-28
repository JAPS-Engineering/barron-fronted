// API Configuration
// En desarrollo, usar ruta relativa para aprovechar el proxy de Vite
// En producción, usar la URL completa del backend
export const API_BASE_URL = import.meta.env.PROD 
  ? "http://localhost:8000" 
  : ""

// Machine IDs - Actualizados para coincidir con las máquinas del backend
export const MACHINE_IDS = ['Linea_1', 'Linea_2']

// Time slots for the day (24 hours)
export const HOURS = Array.from({ length: 24 }, (_, i) => i)

// View modes
export const VIEW_MODES = {
  DAILY: 'DAILY', // 7 machines in one day
  INDIVIDUAL: 'INDIVIDUAL' // 1 machine in 7 days
}

// Get current time in Santiago, Chile timezone
export function getSantiagoTime() {
  const now = new Date()
  // Convert to Santiago timezone (America/Santiago)
  const santiagoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Santiago' }))
  return santiagoTime
}

// Get current hour and minute in Santiago timezone
export function getSantiagoTimeComponents() {
  const santiagoTime = getSantiagoTime()
  return {
    hour: santiagoTime.getHours(),
    minute: santiagoTime.getMinutes(),
    second: santiagoTime.getSeconds()
  }
}

