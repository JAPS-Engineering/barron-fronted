import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Clock, Package, Settings } from 'lucide-react'

// Mobile view for daily schedule - shows machines as cards with blocks
export function MobileDailyView({ machines, blocks, onBlockClick, currentDate }) {
  return (
    <div className="p-4 space-y-4">
      {machines.map((machineId) => {
        const machineBlocks = blocks
          .filter(block => block.machineId === machineId)
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

        if (machineBlocks.length === 0) return null

        return (
          <div key={machineId} className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Machine Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 rounded-t-lg flex items-center space-x-2">
              <Settings size={18} className="text-gray-600" />
              <h3 className="font-semibold text-gray-800">{machineId}</h3>
            </div>

            {/* Blocks List */}
            <div className="divide-y divide-gray-100">
              {machineBlocks.map((block) => {
                const startDate = new Date(block.startTime)
                const endDate = new Date(block.endTime)
                const duration = (endDate - startDate) / (1000 * 60) // minutes
                const isProduction = block.type === 'PRODUCTION'

                return (
                  <div
                    key={block.id}
                    onClick={() => onBlockClick(block)}
                    className={`p-4 active:bg-gray-50 transition-colors ${
                      isProduction ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className={`font-semibold text-sm mb-1 ${
                          isProduction ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {isProduction ? (block.productName || block.id) : block.description}
                        </div>
                        {isProduction && block.format && (
                          <div className="text-xs text-gray-600 mb-1">
                            Formato: {block.format}
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        isProduction ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {isProduction ? 'Producción' : 'Setup'}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>
                          {format(startDate, 'HH:mm', { locale: es })} - {format(endDate, 'HH:mm', { locale: es })}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{Math.floor(duration / 60)}h {duration % 60}m</span>
                      </div>
                      {isProduction && block.quantity && (
                        <div className="flex items-center space-x-2">
                          <Package size={14} />
                          <span>{block.quantity.toLocaleString()} unidades</span>
                        </div>
                      )}
                      {isProduction && block.otIds && block.otIds.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          OTs: {block.otIds.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Mobile view for individual schedule - shows days as cards with blocks
export function MobileIndividualView({ days, blocks, onBlockClick, currentDate }) {
  return (
    <div className="p-4 space-y-4">
      {days.map((dayDate, dayIndex) => {
        const nextDay = new Date(dayDate)
        nextDay.setDate(nextDay.getDate() + 1)

        const dayBlocks = blocks
          .filter(block => {
            const blockDate = new Date(block.startTime)
            return blockDate >= dayDate && blockDate < nextDay
          })
          .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))

        if (dayBlocks.length === 0) return null

        return (
          <div key={dayIndex} className="bg-white rounded-lg shadow-md border border-gray-200">
            {/* Day Header */}
            <div className="bg-gray-100 px-4 py-3 border-b border-gray-200 rounded-t-lg">
              <h3 className="font-semibold text-gray-800">
                {dayDate.toLocaleDateString('es-ES', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long'
                })}
              </h3>
            </div>

            {/* Blocks List */}
            <div className="divide-y divide-gray-100">
              {dayBlocks.map((block) => {
                const startDate = new Date(block.startTime)
                const endDate = new Date(block.endTime)
                const duration = (endDate - startDate) / (1000 * 60) // minutes
                const isProduction = block.type === 'PRODUCTION'

                return (
                  <div
                    key={block.id}
                    onClick={() => onBlockClick(block)}
                    className={`p-4 active:bg-gray-50 transition-colors ${
                      isProduction ? 'bg-blue-50' : 'bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className={`font-semibold text-sm mb-1 ${
                          isProduction ? 'text-blue-900' : 'text-gray-900'
                        }`}>
                          {isProduction ? (block.productName || block.id) : block.description}
                        </div>
                        {isProduction && block.format && (
                          <div className="text-xs text-gray-600 mb-1">
                            Formato: {block.format}
                          </div>
                        )}
                      </div>
                      <div className={`px-2 py-1 rounded text-xs font-medium ${
                        isProduction ? 'bg-blue-200 text-blue-800' : 'bg-gray-200 text-gray-800'
                      }`}>
                        {isProduction ? 'Producción' : 'Setup'}
                      </div>
                    </div>

                    <div className="space-y-1 text-xs text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock size={14} />
                        <span>
                          {format(startDate, 'HH:mm', { locale: es })} - {format(endDate, 'HH:mm', { locale: es })}
                        </span>
                        <span className="text-gray-400">•</span>
                        <span>{Math.floor(duration / 60)}h {duration % 60}m</span>
                      </div>
                      {isProduction && block.quantity && (
                        <div className="flex items-center space-x-2">
                          <Package size={14} />
                          <span>{block.quantity.toLocaleString()} unidades</span>
                        </div>
                      )}
                      {isProduction && block.otIds && block.otIds.length > 0 && (
                        <div className="text-xs text-gray-500 mt-1">
                          OTs: {block.otIds.join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}

