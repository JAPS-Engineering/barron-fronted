import { useState, useEffect } from 'react'
import { generateMockData, generateMultiDayData } from '../utils/mockData'
import { API_BASE_URL } from '../utils/constants'

// Function to fetch data from backend (prepared for future use)
export async function fetchProductionData(date, machineId = null) {
  try {
    const url = machineId 
      ? `${API_BASE_URL}/api/production?date=${date.toISOString()}&machineId=${machineId}`
      : `${API_BASE_URL}/api/production?date=${date.toISOString()}`
    
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error('Failed to fetch production data')
    }
    return await response.json()
  } catch (error) {
    console.error('Error fetching production data:', error)
    // Fallback to mock data
    return machineId 
      ? generateMultiDayData(machineId, date, 7)
      : generateMockData(date)
  }
}

// Datos de testeo ampliados para el endpoint de schedule
// Con más OTs para generar más contenido en el calendario
const datosTesteo = {
  orders: [
    // Día 1 - OTs urgentes
    { id: "OT1001", due: 12, qty: 800, cluster: 5, format: "A" },
    { id: "OT1002", due: 18, qty: 500, cluster: 4, format: "B" },
    { id: "OT1003", due: 20, qty: 700, cluster: 3, format: "A" },
    { id: "OT1004", due: 28, qty: 1200, cluster: 2, format: "C" },
    { id: "OT1005", due: 30, qty: 600, cluster: 4, format: "B" },
    // Día 2-3
    { id: "OT1006", due: 40, qty: 1500, cluster: 1, format: "A" },
    { id: "OT1007", due: 45, qty: 900, cluster: 2, format: "C" },
    { id: "OT1008", due: 50, qty: 1100, cluster: 5, format: "B" },
    { id: "OT1009", due: 55, qty: 750, cluster: 3, format: "A" },
    { id: "OT1010", due: 60, qty: 1300, cluster: 4, format: "C" },
    // Día 4-5
    { id: "OT1011", due: 72, qty: 950, cluster: 2, format: "B" },
    { id: "OT1012", due: 80, qty: 1400, cluster: 5, format: "A" },
    { id: "OT1013", due: 85, qty: 650, cluster: 3, format: "C" },
    { id: "OT1014", due: 90, qty: 1050, cluster: 4, format: "A" },
    { id: "OT1015", due: 95, qty: 850, cluster: 1, format: "B" },
    // Día 6-7
    { id: "OT1016", due: 110, qty: 1200, cluster: 5, format: "C" },
    { id: "OT1017", due: 115, qty: 1000, cluster: 2, format: "A" },
    { id: "OT1018", due: 120, qty: 700, cluster: 3, format: "B" },
    { id: "OT1019", due: 125, qty: 1350, cluster: 4, format: "C" },
    { id: "OT1020", due: 130, qty: 900, cluster: 1, format: "A" },
    // Más OTs para llenar el calendario
    { id: "OT1021", due: 140, qty: 1100, cluster: 5, format: "B" },
    { id: "OT1022", due: 145, qty: 800, cluster: 2, format: "A" },
    { id: "OT1023", due: 150, qty: 1250, cluster: 3, format: "C" },
    { id: "OT1024", due: 155, qty: 950, cluster: 4, format: "B" },
    { id: "OT1025", due: 160, qty: 1150, cluster: 1, format: "A" },
  ],
  machines: {
    Linea_1: { capacity: 120, available_at: 0, last_format: null },
    Linea_2: { capacity: 90, available_at: 0, last_format: null },
  },
  setup_times: {
    "A-B": 1.5,
    "B-A": 1.5,
    "A-C": 2.0,
    "C-A": 2.0,
    "B-C": 1.0,
    "C-B": 1.0,
  },
  horizonte_aprovechamiento: 12,
  costo_inventario_unitario: 0.002,
  default_setup_time: 1.5,
  start_datetime: "2024-01-25T08:00:00",
  work_hours_per_day: 24.0,
  work_start_hour: 0,
  work_days: [0, 1, 2, 3, 4, 5, 6],
}

// Function to convert backend schedule format to frontend block format
function convertScheduleToBlocks(schedule, startDatetime) {
  const startDate = new Date(startDatetime)
  
  return schedule.map((item) => {
    // Calculate actual start and end times
    // start and end are in hours from start_datetime
    const startTime = new Date(startDate.getTime() + item.start * 60 * 60 * 1000)
    const endTime = new Date(startDate.getTime() + item.end * 60 * 60 * 1000)
    
    if (item.type === 'OT') {
      // Production block
      return {
        id: item.id,
        machineId: item.machine,
        type: 'PRODUCTION',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        productName: item.id, // Use OT ID as product name
        quantity: item.qty_cliente || item.qty || 0,
        format: item.format,
        due: item.due,
        onTime: item.on_time,
        qtyExtra: item.qty_extra || 0,
      }
    } else if (item.type === 'SETUP') {
      // Adjustment/Setup block
      return {
        id: `SETUP-${item.machine}-${item.start}`,
        machineId: item.machine,
        type: 'ADJUSTMENT',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: `SETUP - Cambio de formato`,
        format: item.format || 'N/A',
      }
    }
    
    return null
  }).filter(Boolean) // Remove null entries
}

// Function to fetch schedule from backend and convert to blocks
export async function fetchSchedule(customData = null) {
  try {
    const requestBody = customData || datosTesteo
    
    const response = await fetch(`${API_BASE_URL}/api/schedule`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody)
    })
    
    if (!response.ok) {
      let errorMessage = 'Failed to fetch schedule'
      try {
        const errorData = await response.json()
        errorMessage = errorData.detail || errorData.message || errorMessage
        
        if (response.status === 422 && errorData.detail) {
          const detailStr = Array.isArray(errorData.detail) 
            ? errorData.detail.map(e => `${e.loc?.join('.')}: ${e.msg}`).join('\n')
            : JSON.stringify(errorData.detail)
          errorMessage = `Error de validación:\n${detailStr}`
        }
        
        console.error('Schedule API Error:', errorData)
      } catch (e) {
        errorMessage = response.statusText || errorMessage
      }
      throw new Error(`${errorMessage} (Status: ${response.status})`)
    }
    
    const data = await response.json()
    
    // Convert schedule to blocks format
    const blocks = convertScheduleToBlocks(
      data.schedule || [],
      requestBody.start_datetime || new Date().toISOString()
    )
    
    return {
      blocks,
      logs: data.logs || [],
      schedule: data.schedule || [],
      schedule_by_machine: data.schedule_by_machine || {},
      summary: data.summary || {},
    }
  } catch (error) {
    console.error('Error fetching schedule:', error)
    throw error
  }
}

// Function to fetch schedule logs from backend
// Accepts optional custom data, otherwise uses test data
export async function fetchScheduleLogs(customData = null) {
  try {
    const result = await fetchSchedule(customData)
    return result.logs || []
  } catch (error) {
    console.error('Error fetching schedule logs:', error)
    // Return error message as a log line so user can see what went wrong
    return [`Error: ${error.message}`]
  }
}

// Hook to manage production data
// Now uses the schedule from the backend API
export function useProductionData(date, viewMode, selectedMachine = null) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // Fetch schedule from backend
    const loadSchedule = async () => {
      try {
        // Prepare request data with start_datetime based on current date
        const startDatetime = new Date(date)
        startDatetime.setHours(8, 0, 0, 0) // Start at 8 AM
        
        const requestData = {
          ...datosTesteo,
          start_datetime: startDatetime.toISOString(),
        }
        
        const result = await fetchSchedule(requestData)
        let blocks = result.blocks || []
        
        // Filter by machine if in individual view
        if (viewMode === 'INDIVIDUAL' && selectedMachine) {
          blocks = blocks.filter(block => block.machineId === selectedMachine)
        }
        
        // Filter blocks that are within the visible date range
        if (viewMode === 'INDIVIDUAL') {
          // For individual view, show 7 days starting from currentDate
          const startDate = new Date(date)
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 7)
          
          blocks = blocks.filter(block => {
            const blockDate = new Date(block.startTime)
            return blockDate >= startDate && blockDate < endDate
          })
        } else {
          // For daily view, show only blocks for the selected date
          const startDate = new Date(date)
          startDate.setHours(0, 0, 0, 0)
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 1)
          
          blocks = blocks.filter(block => {
            const blockDate = new Date(block.startTime)
            return blockDate >= startDate && blockDate < endDate
          })
        }
        
        setData(blocks)
        setLoading(false)
      } catch (err) {
        console.error('Error loading schedule:', err)
        setError(err.message)
        setLoading(false)
        // Fallback to empty array on error
        setData([])
      }
    }
    
    loadSchedule()
  }, [date, viewMode, selectedMachine])

  return { data, loading, error }
}

