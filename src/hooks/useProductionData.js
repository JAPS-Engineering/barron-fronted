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

// Hook to manage production data
export function useProductionData(date, viewMode, selectedMachine = null) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    setLoading(true)
    setError(null)

    // For now, use mock data
    // In the future, replace with: fetchProductionData(date, selectedMachine)
    setTimeout(() => {
      try {
        let mockData
        if (viewMode === 'INDIVIDUAL' && selectedMachine) {
          mockData = generateMultiDayData(selectedMachine, date, 7)
        } else {
          mockData = generateMockData(date)
        }
        setData(mockData)
        setLoading(false)
      } catch (err) {
        setError(err.message)
        setLoading(false)
      }
    }, 300) // Simulate API delay
  }, [date, viewMode, selectedMachine])

  return { data, loading, error }
}

