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
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`${isProduction ? 'bg-blue-500' : 'bg-gray-500'} text-white p-4 rounded-t-lg flex justify-between items-center`}>
          <h2 className="text-xl font-bold">
            {isProduction ? 'Detalle de Producción' : 'Detalle de Ajuste'}
          </h2>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
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

          {/* Product Name (if production) */}
          {isProduction && (
            <div className="flex items-start space-x-3">
              <Package className="text-gray-400 mt-1" size={20} />
              <div>
                <div className="text-sm text-gray-500">Producto</div>
                <div className="font-semibold">{block.productName}</div>
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
        <div className="bg-gray-50 px-6 py-4 rounded-b-lg flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md transition-colors font-medium"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}

export default DetailsModal

