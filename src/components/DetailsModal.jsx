import { X, Calendar, Clock, Package, Settings, Hash } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function DetailsModal({ block, isOpen, onClose }) {
  if (!isOpen || !block) return null

  const startDate = new Date(block.startTime)
  const endDate = new Date(block.endTime)
  const duration = (endDate - startDate) / (1000 * 60) // Duration in minutes

  const isProduction = block.type === 'PRODUCTION'

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] flex flex-col mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${isProduction ? 'bg-blue-500' : 'bg-gray-500'} text-white p-3 sm:p-4 rounded-t-lg flex justify-between items-center flex-shrink-0`}>
          <h2 className="text-lg sm:text-xl font-bold truncate pr-2">
            {isProduction ? 'Detalle de Producción' : 'Detalle de Ajuste'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X size={20} className="sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-4 overflow-y-auto flex-1">
          {/* Machine ID */}
          <div className="flex items-start space-x-3">
            <Settings className="text-gray-400 mt-1" size={20} />
            <div>
              <div className="text-sm text-gray-500">Máquina</div>
              <div className="font-semibold">{block.machineId}</div>
            </div>
          </div>

          {/* Type */}
          <div className="flex items-start space-x-3">
            <Hash className="text-gray-400 mt-1" size={20} />
            <div>
              <div className="text-sm text-gray-500">Tipo</div>
              <div className="font-semibold">
                {isProduction ? 'Producción' : 'Ajuste/Mantenimiento'}
              </div>
            </div>
          </div>

          {/* Product Name / OT IDs (if production) */}
          {isProduction && (
            <>
              <div className="flex items-start space-x-3">
                <Package className="text-gray-400 mt-1" size={20} />
                <div>
                  <div className="text-sm text-gray-500">Producto</div>
                  <div className="font-semibold">{block.productName || block.product || block.id}</div>
                </div>
              </div>
              {block.otIds && block.otIds.length > 0 && (
                <div className="flex items-start space-x-3">
                  <Hash className="text-gray-400 mt-1" size={20} />
                  <div className="flex-1">
                    <div className="text-sm text-gray-500">Órdenes de Trabajo</div>
                    <div className="space-y-1 mt-1">
                      {block.otIds.map((otId) => {
                        // Check if this OT is delayed
                        const delayedInfo = block.delayedOTs?.find(d => d.otId === otId)
                        const isDelayed = !!delayedInfo
                        
                        return (
                          <div
                            key={otId}
                            className={`flex flex-col sm:flex-row sm:items-center sm:justify-between p-2 rounded gap-1 sm:gap-0 ${
                              isDelayed ? 'bg-red-50 border border-red-200' : 'bg-gray-50'
                            }`}
                          >
                            <span className={`font-semibold text-sm sm:text-base ${isDelayed ? 'text-red-700' : 'text-gray-900'}`}>
                              {otId}
                            </span>
                            {isDelayed && (
                              <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-2 text-xs">
                                <span className="text-red-600 font-semibold">⚠ Atrasada</span>
                                <span className="text-red-500">
                                  {delayedInfo.atrasoHoras.toFixed(1)}h de atraso
                                </span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {block.delayedOTs && block.delayedOTs.length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                        <div className="font-semibold text-yellow-800 mb-1">Información de Atrasos:</div>
                        {block.delayedOTs.map((delayed) => (
                          <div key={delayed.otId} className="text-yellow-700">
                            <strong>{delayed.otId}</strong>: {delayed.atrasoHoras.toFixed(1)}h de atraso
                            {delayed.due !== undefined && (
                              <span className="ml-2 text-yellow-600">
                                (Límite: {delayed.due}h, Completada: {delayed.completion?.toFixed(1) || 'N/A'}h)
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-2">
                      {block.otIds.length} {block.otIds.length === 1 ? 'OT' : 'OTs'} beneficiadas
                      {block.delayedOTs && block.delayedOTs.length > 0 && (
                        <span className="text-red-600 ml-2">
                          ({block.delayedOTs.length} {block.delayedOTs.length === 1 ? 'atrasada' : 'atrasadas'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Format (if production) */}
          {isProduction && block.format && (
            <div className="flex items-start space-x-3">
              <Hash className="text-gray-400 mt-1" size={20} />
              <div>
                <div className="text-sm text-gray-500">Formato</div>
                <div className="font-semibold">{block.format}</div>
              </div>
            </div>
          )}


          {/* Extra Quantity (if production) */}
          {isProduction && block.qtyExtra !== undefined && block.qtyExtra > 0 && (
            <div className="flex items-start space-x-3">
              <Hash className="text-gray-400 mt-1" size={20} />
              <div>
                <div className="text-sm text-gray-500">Cantidad Extra</div>
                <div className="font-semibold">{block.qtyExtra.toLocaleString()} unidades</div>
              </div>
            </div>
          )}

          {/* Quantity (if production) */}
          {isProduction && (
            <div className="flex items-start space-x-3">
              <Hash className="text-gray-400 mt-1" size={20} />
              <div>
                <div className="text-sm text-gray-500">Cantidad</div>
                <div className="font-semibold">
                  {block.quantity.toLocaleString()} unidades
                </div>
              </div>
            </div>
          )}

          {/* Description (if adjustment) */}
          {!isProduction && (
            <div className="flex items-start space-x-3">
              <Package className="text-gray-400 mt-1" size={20} />
              <div>
                <div className="text-sm text-gray-500">Descripción</div>
                <div className="font-semibold">{block.description}</div>
              </div>
            </div>
          )}

          {/* Start Time */}
          <div className="flex items-start space-x-3">
            <Calendar className="text-gray-400 mt-1" size={20} />
            <div>
              <div className="text-sm text-gray-500">Fecha de Inicio</div>
              <div className="font-semibold">
                {format(startDate, "dd 'de' MMMM 'de' yyyy", { locale: es })}
              </div>
            </div>
          </div>

          {/* Time Range */}
          <div className="flex items-start space-x-3">
            <Clock className="text-gray-400 mt-1" size={20} />
            <div>
              <div className="text-sm text-gray-500">Horario</div>
              <div className="font-semibold">
                {format(startDate, 'HH:mm', { locale: es })} - {format(endDate, 'HH:mm', { locale: es })}
              </div>
            </div>
          </div>

          {/* Duration */}
          <div className="flex items-start space-x-3">
            <Clock className="text-gray-400 mt-1" size={20} />
            <div>
              <div className="text-sm text-gray-500">Duración</div>
              <div className="font-semibold">
                {Math.floor(duration / 60)}h {duration % 60}m
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-4 sm:px-6 py-3 sm:py-4 rounded-b-lg flex justify-end flex-shrink-0 border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors font-medium text-sm sm:text-base"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailsModal

