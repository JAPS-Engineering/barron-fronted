import { useState, useEffect, useMemo } from 'react'
import CalendarHeader from './CalendarHeader'
import MachineColumn from './MachineColumn'
import DayColumn from './DayColumn'
import DetailsModal from './DetailsModal'
import ConsoleModal from './ConsoleModal'
import { useProductionData, fetchScheduleLogs } from '../hooks/useProductionData'
import { MACHINE_IDS, VIEW_MODES, getSantiagoTimeComponents } from '../utils/constants'

function Layout() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState(VIEW_MODES.DAILY)
  const [selectedMachines, setSelectedMachines] = useState([...MACHINE_IDS])
  const [selectedBlock, setSelectedBlock] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConsoleOpen, setIsConsoleOpen] = useState(false)
  const [consoleLogs, setConsoleLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)
  const [visibleMachineIndex, setVisibleMachineIndex] = useState(0)

  // For individual view, select first machine by default
  const [individualMachine, setIndividualMachine] = useState(MACHINE_IDS[0])

  const { data, loading } = useProductionData(
    currentDate,
    viewMode,
    viewMode === VIEW_MODES.INDIVIDUAL ? individualMachine : null
  )

  // Calculate hour height based on viewport
  const hourHeight = 80 // pixels per hour

  // Get visible machines (max 7)
  const visibleMachines = useMemo(() => {
    if (viewMode === VIEW_MODES.DAILY) {
      const filtered = selectedMachines.slice(visibleMachineIndex, visibleMachineIndex + 7)
      return filtered
    } else {
      // Individual view: show 7 days for one machine
      return [individualMachine]
    }
  }, [viewMode, selectedMachines, visibleMachineIndex, individualMachine])
  
  // Debug: log data
  useEffect(() => {
    if (data.length > 0) {
      console.log('Layout - Total blocks:', data.length)
      console.log('Layout - Sample block:', data[0])
      console.log('Layout - Visible machines:', visibleMachines)
    }
  }, [data, visibleMachines])

  // Handle machine filter toggle
  const handleMachineToggle = (machineId) => {
    setSelectedMachines((prev) =>
      prev.includes(machineId)
        ? prev.filter((id) => id !== machineId)
        : [...prev, machineId]
    )
  }

  // Handle block click
  const handleBlockClick = (block) => {
    setSelectedBlock(block)
    setIsModalOpen(true)
  }

  // Handle modal close
  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedBlock(null)
  }

  // Handle view mode change
  const handleViewModeChange = (newMode) => {
    setViewMode(newMode)
    if (newMode === VIEW_MODES.INDIVIDUAL && !selectedMachines.includes(individualMachine)) {
      setIndividualMachine(selectedMachines[0] || MACHINE_IDS[0])
    }
  }

  // Handle console click
  const handleConsoleClick = async () => {
    setIsConsoleOpen(true)
    setLoadingLogs(true)
    try {
      const logs = await fetchScheduleLogs()
      setConsoleLogs(logs)
    } catch (error) {
      console.error('Error loading logs:', error)
      setConsoleLogs(['Error al cargar los logs. Por favor, intente nuevamente.'])
    } finally {
      setLoadingLogs(false)
    }
  }

  // Handle console close
  const handleConsoleClose = () => {
    setIsConsoleOpen(false)
  }

  // Scroll to current time on load (using Santiago time)
  useEffect(() => {
    const { hour: currentHour, minute: currentMinute } = getSantiagoTimeComponents()
    const scrollPosition = (currentHour + currentMinute / 60) * hourHeight - 200 // Offset for better visibility
    
    if (viewMode === VIEW_MODES.DAILY) {
      const calendarContainer = document.getElementById('calendar-container')
      if (calendarContainer) {
        calendarContainer.scrollTop = Math.max(0, scrollPosition)
      }
    } else {
      const calendarContainer = document.getElementById('calendar-container-individual')
      if (calendarContainer) {
        calendarContainer.scrollTop = Math.max(0, scrollPosition)
      }
    }
  }, [viewMode, hourHeight, data])


  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <CalendarHeader
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        viewMode={viewMode}
        onViewModeChange={handleViewModeChange}
        selectedMachines={selectedMachines}
        onMachineToggle={handleMachineToggle}
        visibleMachines={visibleMachines}
        individualMachine={individualMachine}
        onIndividualMachineChange={setIndividualMachine}
        onConsoleClick={handleConsoleClick}
      />

      {/* Calendar Grid */}
      <div className="flex-1 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-gray-500">Cargando datos...</div>
          </div>
        ) : (
          <div className="h-full overflow-hidden">
            {viewMode === VIEW_MODES.DAILY ? (
              <div className="flex h-full overflow-y-auto" id="calendar-container">
                {/* Time column (left side) - inside scrollable container */}
                <div className="w-20 bg-gray-50 border-r border-gray-300 sticky left-0 z-10 flex flex-col flex-shrink-0">
                  <div className="h-12 border-b border-gray-300 flex-shrink-0 sticky top-0 bg-gray-50 z-20"></div>
                  <div className="relative" id="time-column" style={{ height: `${25 * hourHeight}px` }}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="border-b border-gray-200 text-xs text-gray-500 px-2 py-1"
                        style={{ height: `${hourHeight}px` }}
                      >
                        {String(i).padStart(2, '0')}:00
                      </div>
                    ))}
                    {/* Add 00:00 after 23:00 for blocks ending at 23:59 */}
                    <div
                      className="border-b border-gray-200 text-xs text-gray-500 px-2 py-1"
                      style={{ height: `${hourHeight}px` }}
                    >
                      00:00
                    </div>
                  </div>
                </div>

                {/* Machine columns */}
                <div className="flex flex-1">
                  {visibleMachines.map((machineId) => (
                    <MachineColumn
                      key={machineId}
                      machineId={machineId}
                      blocks={data}
                      onBlockClick={handleBlockClick}
                      hourHeight={hourHeight}
                      currentTime={new Date()}
                      viewMode={viewMode}
                      date={currentDate}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Individual view: 7 days for one machine
              <div className="flex h-full overflow-y-auto" id="calendar-container-individual">
                {/* Time column - inside scrollable container */}
                <div className="w-20 bg-gray-50 border-r border-gray-300 sticky left-0 z-10 flex flex-col flex-shrink-0">
                  <div className="h-12 border-b border-gray-300 flex items-center justify-center font-semibold text-sm text-gray-700 flex-shrink-0 sticky top-0 bg-gray-50 z-20">
                    {individualMachine}
                  </div>
                  <div className="relative" id="time-column-individual" style={{ height: `${25 * hourHeight}px` }}>
                    {Array.from({ length: 24 }, (_, i) => (
                      <div
                        key={i}
                        className="border-b border-gray-200 text-xs text-gray-500 px-2 py-1"
                        style={{ height: `${hourHeight}px` }}
                      >
                        {String(i).padStart(2, '0')}:00
                      </div>
                    ))}
                    {/* Add 00:00 after 23:00 for blocks ending at 23:59 */}
                    <div
                      className="border-b border-gray-200 text-xs text-gray-500 px-2 py-1"
                      style={{ height: `${hourHeight}px` }}
                    >
                      00:00
                    </div>
                  </div>
                </div>

                {/* Day columns */}
                <div className="flex flex-1">
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayDate = new Date(currentDate)
                    dayDate.setDate(dayDate.getDate() + dayIndex)
                    dayDate.setHours(0, 0, 0, 0)
                    
                    const nextDay = new Date(dayDate)
                    nextDay.setDate(nextDay.getDate() + 1)
                    
                    // Filter blocks that intersect with this day
                    // A block should be shown if:
                    // 1. It starts in this day, OR
                    // 2. It ends in this day, OR
                    // 3. It spans across this day (starts before and ends after)
                    const dayBlocks = data
                      .map((block) => {
                        const blockStart = new Date(block.startTime)
                        const blockEnd = new Date(block.endTime)
                        
                        // Check if block intersects with this day
                        const startsInDay = blockStart >= dayDate && blockStart < nextDay
                        const endsInDay = blockEnd > dayDate && blockEnd <= nextDay
                        const spansDay = blockStart < dayDate && blockEnd > nextDay
                        
                        if (startsInDay || endsInDay || spansDay) {
                          // Create a modified block for this day
                          const modifiedBlock = { ...block }
                          
                          // If block starts before this day, adjust start to beginning of day
                          if (blockStart < dayDate) {
                            modifiedBlock.startTime = dayDate.toISOString()
                            modifiedBlock.isContinuation = true // Mark as continuation
                          }
                          
                          // If block ends after this day, adjust end to end of day
                          if (blockEnd > nextDay) {
                            modifiedBlock.endTime = nextDay.toISOString()
                            modifiedBlock.isPartial = true // Mark as partial
                          }
                          
                          return modifiedBlock
                        }
                        
                        return null
                      })
                      .filter(Boolean)

                    return (
                      <DayColumn
                        key={dayIndex}
                        date={dayDate}
                        blocks={dayBlocks}
                        onBlockClick={handleBlockClick}
                        hourHeight={hourHeight}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Details Modal */}
      <DetailsModal
        block={selectedBlock}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* Console Modal */}
      <ConsoleModal
        isOpen={isConsoleOpen}
        onClose={handleConsoleClose}
        logs={consoleLogs}
      />
    </div>
  )
}

export default Layout

