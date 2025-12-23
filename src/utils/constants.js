// API Configuration
export const API_BASE_URL = "http://localhost:8000"

// Machine IDs
export const MACHINE_IDS = Array.from({ length: 10 }, (_, i) => `Cortadora ${i + 1}`)

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

