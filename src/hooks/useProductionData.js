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
// Usando el nuevo formato optimizado con múltiples productos por OT
const datosTesteo = {
  orders: [
    {"id": "OT0", "due": 20, "cluster": 5, "products": {"A": 200, "B": 300}},
    {"id": "OT1", "due": 20, "cluster": 4, "products": {"B": 250, "C": 150}},
    {"id": "OT2", "due": 20, "cluster": 3, "products": {"A": 180, "B": 200}},
    {"id": "OT3", "due": 20, "cluster": 2, "products": {"C": 400}},
    {"id": "OT4", "due": 20, "cluster": 4, "products": {"A": 150, "C": 200}},
    {"id": "OT5", "due": 40, "cluster": 1, "products": {"A": 500, "B": 300}},
    {"id": "OT6", "due": 60, "cluster": 2, "products": {"C": 350, "B": 200}},
    {"id": "OT7", "due": 60, "cluster": 5, "products": {"B": 400}},
    {"id": "OT8", "due": 60, "cluster": 3, "products": {"A": 250, "B": 150, "C": 100}},
    {"id": "OT9", "due": 60, "cluster": 4, "products": {"C": 450}},
    {"id": "OT10", "due": 80, "cluster": 2, "products": {"B": 300, "A": 200}},
    {"id": "OT11", "due": 80, "cluster": 5, "products": {"A": 600, "B": 400}},
    {"id": "OT12", "due": 80, "cluster": 3, "products": {"C": 250, "A": 150}},
    {"id": "OT13", "due": 80, "cluster": 4, "products": {"A": 400, "C": 300}},
    {"id": "OT14", "due": 80, "cluster": 1, "products": {"B": 350}},
    {"id": "OT15", "due": 100, "cluster": 5, "products": {"C": 500, "B": 200}},
    {"id": "OT16", "due": 100, "cluster": 2, "products": {"A": 400}},
    {"id": "OT17", "due": 100, "cluster": 3, "products": {"B": 250, "C": 150}},
    {"id": "OT18", "due": 100, "cluster": 4, "products": {"C": 550, "A": 300}},
    {"id": "OT19", "due": 100, "cluster": 1, "products": {"A": 350, "B": 250}},
    {"id": "OT20", "due": 100, "cluster": 5, "products": {"B": 450, "A": 200}},
    {"id": "OT21", "due": 100, "cluster": 2, "products": {"A": 300, "C": 250}},
    {"id": "OT22", "due": 100, "cluster": 3, "products": {"C": 500}},
    {"id": "OT23", "due": 100, "cluster": 4, "products": {"B": 380, "A": 220}},
    {"id": "OT24", "due": 100, "cluster": 1, "products": {"A": 450, "B": 300, "C": 200}},
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
// Supports both new format (PRODUCTION with ot_ids) and old format (OT)
function convertScheduleToBlocks(schedule, startDatetime) {
  const startDate = new Date(startDatetime)
  
  return schedule.map((item) => {
    // Calculate actual start and end times
    // start and end are in hours from start_datetime
    const startTime = new Date(startDate.getTime() + item.start * 60 * 60 * 1000)
    const endTime = new Date(startDate.getTime() + item.end * 60 * 60 * 1000)
    
    if (item.type === 'PRODUCTION') {
      // New format: Production block with multiple OTs
      const product = item.product || item.format || 'N/A'
      const otIds = item.ot_ids || []
      const otIdsStr = otIds.length > 0 ? otIds.join(', ') : 'N/A'
      
      return {
        id: `PROD-${item.machine}-${item.start}-${product}`,
        machineId: item.machine,
        type: 'PRODUCTION',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        productName: `Producto ${product}`, // Product name
        quantity: item.quantity || 0,
        format: product,
        product: product,
        otIds: otIds,
        otIdsStr: otIdsStr, // For display
        onTime: item.on_time !== undefined ? item.on_time : true,
        // Store original item for details modal
        originalItem: item,
      }
    } else if (item.type === 'OT') {
      // Old format: Single OT block (for compatibility)
      return {
        id: item.id || `OT-${item.machine}-${item.start}`,
        machineId: item.machine,
        type: 'PRODUCTION',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        productName: item.id, // Use OT ID as product name
        quantity: item.qty_cliente || item.qty || 0,
        format: item.format,
        due: item.due,
        onTime: item.on_time !== undefined ? item.on_time : true,
        qtyExtra: item.qty_extra || 0,
        // Store original item for details modal
        originalItem: item,
      }
    } else if (item.type === 'SETUP') {
      // Adjustment/Setup block
      const format = item.format || 'N/A'
      return {
        id: `SETUP-${item.machine}-${item.start}`,
        machineId: item.machine,
        type: 'ADJUSTMENT',
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        description: `SETUP - Cambio a formato ${format}`,
        format: format,
        // Store original item for details modal
        originalItem: item,
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
  const [atrasos, setAtrasos] = useState([]) // Store delays information

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
        
        // Store atrasos information for use in details modal
        const atrasosInfo = result.summary?.atrasos || []
        setAtrasos(atrasosInfo)
        
        // Add atrasos information to blocks that have OTs
        blocks = blocks.map(block => {
          if (block.type === 'PRODUCTION' && block.otIds && block.otIds.length > 0) {
            // Find which OTs in this block are delayed
            const delayedOTs = atrasosInfo
              .filter(atraso => block.otIds.includes(atraso.ot_id))
              .map(atraso => ({
                otId: atraso.ot_id,
                atrasoHoras: atraso.atraso_horas,
                cluster: atraso.cluster,
                due: atraso.due,
                completion: atraso.completion,
              }))
            
            return {
              ...block,
              delayedOTs: delayedOTs, // Add delayed OTs info
            }
          }
          return block
        })
        
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

  return { data, loading, error, atrasos }
}

