// Mock data generator for production scheduling
// Each machine has continuous scheduling (100% occupancy)

const PRODUCTS = [
  "Tela Polipropileno 40g",
  "Tela Polipropileno 50g",
  "Tela Polipropileno 60g",
  "Tela Poliéster 80g",
  "Tela Poliéster 100g",
  "Tela No Tejida 30g",
  "Tela No Tejida 45g",
  "Tela No Tejida 70g"
]

const ADJUSTMENT_DESCRIPTIONS = [
  "Cambio de cuchillas",
  "Ajuste de gramaje",
  "Mantenimiento preventivo",
  "Limpieza de máquina",
  "Calibración de temperatura",
  "Cambio de filtros",
  "Ajuste de velocidad",
  "Revisión de rodillos"
]

// Generate a random date within the day
function getRandomTimeInDay(date, minHour = 0, maxHour = 24) {
  const hour = Math.floor(Math.random() * (maxHour - minHour)) + minHour
  const minute = Math.floor(Math.random() * 60)
  const newDate = new Date(date)
  newDate.setHours(hour, minute, 0, 0)
  return newDate
}

// Generate continuous schedule for a machine starting from a given date
function generateMachineSchedule(machineId, startDate) {
  const schedule = []
  let currentTime = new Date(startDate)
  currentTime.setHours(0, 0, 0, 0) // Start at midnight
  
  const endOfDay = new Date(startDate)
  endOfDay.setHours(23, 59, 59, 999)
  
  let blockId = 1
  
  while (currentTime < endOfDay) {
    const isProduction = Math.random() > 0.3 // 70% production, 30% adjustment
    
    let endTime
    if (isProduction) {
      // Production blocks: 2-8 hours
      const duration = (Math.random() * 6 + 2) * 60 * 60 * 1000 // 2-8 hours in ms
      endTime = new Date(currentTime.getTime() + duration)
      
      // Don't exceed end of day
      if (endTime > endOfDay) {
        endTime = new Date(endOfDay)
      }
      
      schedule.push({
        id: `${machineId}-${blockId}`,
        machineId,
        type: 'PRODUCTION',
        startTime: new Date(currentTime),
        endTime: new Date(endTime),
        productName: PRODUCTS[Math.floor(Math.random() * PRODUCTS.length)],
        quantity: Math.floor(Math.random() * 5000 + 1000) // 1000-6000 units
      })
    } else {
      // Adjustment blocks: 30 minutes to 2 hours
      const duration = (Math.random() * 1.5 + 0.5) * 60 * 60 * 1000 // 0.5-2 hours
      endTime = new Date(currentTime.getTime() + duration)
      
      if (endTime > endOfDay) {
        endTime = new Date(endOfDay)
      }
      
      schedule.push({
        id: `${machineId}-${blockId}`,
        machineId,
        type: 'ADJUSTMENT',
        startTime: new Date(currentTime),
        endTime: new Date(endTime),
        description: ADJUSTMENT_DESCRIPTIONS[Math.floor(Math.random() * ADJUSTMENT_DESCRIPTIONS.length)]
      })
    }
    
    currentTime = new Date(endTime)
    blockId++
    
    // Safety break to avoid infinite loops
    if (blockId > 50) break
  }
  
  return schedule
}

// Generate mock data for all machines
export function generateMockData(date = new Date()) {
  const allSchedules = []
  
  // Generate for 10 machines
  for (let i = 1; i <= 10; i++) {
    const machineId = `Cortadora ${i}`
    const machineSchedule = generateMachineSchedule(machineId, date)
    allSchedules.push(...machineSchedule)
  }
  
  return allSchedules
}

// Generate data for multiple days (for individual machine view)
export function generateMultiDayData(machineId, startDate, days = 7) {
  const allSchedules = []
  
  for (let day = 0; day < days; day++) {
    const currentDate = new Date(startDate)
    currentDate.setDate(currentDate.getDate() + day)
    const daySchedule = generateMachineSchedule(machineId, currentDate)
    allSchedules.push(...daySchedule)
  }
  
  return allSchedules
}

