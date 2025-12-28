import ProductionBlock from './ProductionBlock'

function DayColumn({ date, blocks, onBlockClick, hourHeight }) {
  const hours = Array.from({ length: 24 }, (_, i) => i)
  
  // Sort blocks by startTime
  const sortedBlocks = [...blocks].sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
  
  // Calculate positions with gaps between consecutive blocks
  const gapSize = 2
  const blocksWithPositions = []
  
  sortedBlocks.forEach((block, index) => {
    const startDate = new Date(block.startTime)
    const endDate = new Date(block.endTime)
    
    // Get the day start (00:00 of the current day column)
    const dayStart = new Date(date)
    dayStart.setHours(0, 0, 0, 0)
    
    // Calculate minutes from start of day
    const startMinutes = Math.max(0, (startDate - dayStart) / (1000 * 60))
    const endMinutes = Math.min(24 * 60, (endDate - dayStart) / (1000 * 60))
    
    // Calculate duration within this day
    const duration = endMinutes - startMinutes
    
    // Base position from start time (relative to day start)
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
    let adjustedHeight = index < sortedBlocks.length - 1 
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
      isLast: index === sortedBlocks.length - 1
    })
  })

  return (
    <div className="flex flex-col border-r border-gray-300 flex-1">
      {/* Day Header */}
      <div className="bg-gray-100 border-b border-gray-300 p-3 font-semibold text-sm text-gray-700 sticky top-0 z-10 flex-shrink-0">
        {date.toLocaleDateString('es-ES', {
          weekday: 'short',
          day: 'numeric',
          month: 'short'
        })}
      </div>

      {/* Time Grid */}
      <div className="relative" style={{ height: `${25 * hourHeight}px` }}>
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

export default DayColumn

