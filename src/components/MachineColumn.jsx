import { useState, useEffect } from 'react'
import ProductionBlock from './ProductionBlock'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { getSantiagoTimeComponents } from '../utils/constants'

function MachineColumn({ machineId, blocks, onBlockClick, hourHeight, currentTime, viewMode, date }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  // Get current time in Santiago, Chile and update every minute
  const [santiagoTime, setSantiagoTime] = useState(getSantiagoTimeComponents())
  
  useEffect(() => {
    const updateTime = () => {
      setSantiagoTime(getSantiagoTimeComponents())
    }
    
    // Update immediately
    updateTime()
    
    // Update every minute
    const interval = setInterval(updateTime, 60000) // 60000ms = 1 minute
    
    return () => clearInterval(interval)
  }, [])
  
  const currentPosition = (santiagoTime.hour + santiagoTime.minute / 60) * hourHeight

  // Filter blocks for this machine and sort by startTime
  const machineBlocks = blocks
    .filter(block => block.machineId === machineId)
    .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  
  // Calculate positions with gaps between consecutive blocks (same as DayColumn)
  const gapSize = 2
  const blocksWithPositions = []
  
  machineBlocks.forEach((block, index) => {
    const startDate = new Date(block.startTime)
    const endDate = new Date(block.endTime)
    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes()
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes()
    
    // Calculate duration, ensuring it doesn't exceed 24 hours
    let duration = endMinutes - startMinutes
    if (duration < 0) {
      // Handle case where end time is next day (shouldn't happen but just in case)
      duration = (24 * 60) - startMinutes + endMinutes
    }
    
    // Base position from start time
    const baseTopPosition = (startMinutes / 60) * hourHeight
    let baseHeight = (duration / 60) * hourHeight
    
    // Limit height to not exceed 24 hours (the end of the day)
    const maxHeight = (24 * hourHeight) - baseTopPosition
    baseHeight = Math.min(baseHeight, maxHeight)
    
    // Adjust position if there's a previous block
    let adjustedTopPosition = baseTopPosition
    if (index > 0) {
      const previousBlock = blocksWithPositions[index - 1]
      const previousEndPosition = previousBlock.adjustedTopPosition + previousBlock.adjustedHeight
      // If this block starts right after the previous one, add gap
      if (Math.abs(baseTopPosition - previousEndPosition) < 1) {
        adjustedTopPosition = previousEndPosition + gapSize
      }
    }
    
    // Calculate max allowed height from adjusted position to end of day (24 hours)
    const maxAllowedHeight = (24 * hourHeight) - adjustedTopPosition
    
    // Reduce height if not last to create gap for next block
    // But ensure we don't exceed max height (end of day at 24:00)
    let adjustedHeight = index < machineBlocks.length - 1 
      ? Math.min(baseHeight - gapSize, maxAllowedHeight)
      : Math.min(baseHeight, maxAllowedHeight)
    
    // Ensure minimum height but never exceed max allowed
    adjustedHeight = Math.min(Math.max(adjustedHeight, 40), maxAllowedHeight)
    
    // Final check: ensure the block doesn't extend beyond 24 hours
    const finalEndPosition = adjustedTopPosition + adjustedHeight
    if (finalEndPosition > 24 * hourHeight) {
      adjustedHeight = (24 * hourHeight) - adjustedTopPosition
    }
    
    blocksWithPositions.push({
      ...block,
      adjustedTopPosition,
      adjustedHeight,
      isLast: index === machineBlocks.length - 1
    })
  })
  

  return (
    <div className="flex flex-col border-r border-gray-300 flex-1">
      {/* Machine Header */}
      <div className="bg-gray-100 border-b border-gray-300 p-3 font-semibold text-sm text-gray-700 sticky top-0 z-10 flex-shrink-0">
        {machineId}
      </div>
      
      {/* Time Grid */}
      <div className="relative" style={{ height: `${25 * hourHeight}px`, minHeight: `${25 * hourHeight}px` }}>
        {/* Hour markers */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="border-b border-gray-200"
            style={{ height: `${hourHeight}px` }}
          >
            <div className="text-xs text-gray-500 px-2 py-1">
              {String(hour).padStart(2, '0')}:00
            </div>
          </div>
        ))}
        {/* Add 00:00 after 23:00 for blocks ending at 23:59 */}
        <div
          className="border-b border-gray-200"
          style={{ height: `${hourHeight}px` }}
        >
          <div className="text-xs text-gray-500 px-2 py-1">
            00:00
          </div>
        </div>
        
        {/* Current time indicator */}
        {viewMode === 'DAILY' && (
          <div
            className="absolute left-0 right-0 z-40 pointer-events-none"
            style={{ top: `${currentPosition}px`, zIndex: 40 }}
          >
            <div className="h-0.5 bg-red-500 relative">
              <div className="absolute -left-2 -top-1 w-3 h-3 bg-red-500 rounded-full"></div>
            </div>
          </div>
        )}
        
        {/* Production Blocks */}
        {blocksWithPositions.map((blockData) => {
          return (
            <ProductionBlock
              key={blockData.id}
              block={blockData}
              onClick={onBlockClick}
              hourHeight={hourHeight}
              topPosition={blockData.adjustedTopPosition}
              blockHeight={blockData.adjustedHeight}
              isLast={blockData.isLast}
            />
          )
        })}
      </div>
    </div>
  )
}

export default MachineColumn

