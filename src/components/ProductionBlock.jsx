import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function ProductionBlock({ block, onClick, hourHeight, topPosition, blockHeight, isLast = false }) {
  // Use provided positions if available, otherwise calculate from block times
  const startDate = new Date(block.startTime)
  const endDate = new Date(block.endTime)
  
  const calculatedTopPosition = topPosition !== undefined 
    ? topPosition 
    : (startDate.getHours() * 60 + startDate.getMinutes()) / 60 * hourHeight
  
  const calculatedHeight = blockHeight !== undefined
    ? blockHeight
    : ((endDate.getHours() * 60 + endDate.getMinutes()) - (startDate.getHours() * 60 + startDate.getMinutes())) / 60 * hourHeight
  
  const isProduction = block.type === 'PRODUCTION'
  const bgColor = isProduction 
    ? 'bg-blue-300 hover:bg-blue-400' 
    : 'bg-gray-400 hover:bg-gray-500'
  
  const textColor = isProduction ? 'text-gray-900' : 'text-gray-900'

  const finalHeight = Math.max(calculatedHeight, 40)
  const isSmallBlock = finalHeight < 60
  const padding = isSmallBlock ? 'p-1' : 'p-2'

  return (
    <div
      className={`absolute left-1 right-1 rounded-md ${bgColor} ${textColor} ${padding} cursor-pointer transition-all shadow-sm border border-opacity-20 z-30 overflow-hidden ${
        isProduction ? 'border-blue-400' : 'border-gray-500'
      }`}
      style={{
        top: `${calculatedTopPosition}px`,
        height: `${finalHeight}px`,
        minHeight: '40px',
        position: 'absolute',
        zIndex: 30,
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box'
      }}
      onClick={() => onClick(block)}
    >
      <div className="text-xs font-semibold truncate flex-shrink-0">
        {isProduction ? block.productName : block.description}
      </div>
      {isProduction && !isSmallBlock && (
        <div className="text-xs mt-0.5 opacity-90 truncate flex-shrink-0">
          {block.quantity.toLocaleString()} unidades
        </div>
      )}
      <div className="text-xs mt-0.5 opacity-75 truncate flex-shrink-0">
        {format(startDate, 'HH:mm', { locale: es })} - {format(endDate, 'HH:mm', { locale: es })}
      </div>
    </div>
  )
}

export default ProductionBlock

