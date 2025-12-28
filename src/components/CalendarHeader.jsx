import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Filter, Terminal } from 'lucide-react'
import { format, addDays, subDays, isToday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { MACHINE_IDS, VIEW_MODES } from '../utils/constants'

function CalendarHeader({ 
  currentDate, 
  onDateChange, 
  viewMode, 
  onViewModeChange,
  selectedMachines,
  onMachineToggle,
  visibleMachines,
  onVisibleMachinesChange,
  individualMachine,
  onIndividualMachineChange,
  onConsoleClick
}) {
  const goToToday = () => {
    onDateChange(new Date())
  }

  const goToPrevious = () => {
    if (viewMode === VIEW_MODES.DAILY) {
      onDateChange(subDays(currentDate, 1))
    } else {
      onDateChange(subDays(currentDate, 7))
    }
  }

  const goToNext = () => {
    if (viewMode === VIEW_MODES.DAILY) {
      onDateChange(addDays(currentDate, 1))
    } else {
      onDateChange(addDays(currentDate, 7))
    }
  }

  const [showMachineFilter, setShowMachineFilter] = useState(false)

  return (
    <div className="bg-white border-b border-gray-300 shadow-sm">
      <div className="px-6 py-4">
        {/* Title and Date Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">
              Programación de Producción - Planta Telas No Tejidas
            </h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className="flex items-center space-x-2">
                <CalendarIcon size={18} className="text-gray-500" />
                <span className="text-sm text-gray-600">
                  {viewMode === VIEW_MODES.DAILY
                    ? format(currentDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })
                    : `${format(currentDate, "d 'de' MMM", { locale: es })} - ${format(addDays(currentDate, 6), "d 'de' MMM 'de' yyyy", { locale: es })}`}
                </span>
              </div>
            </div>
          </div>

          {/* Date Navigation */}
          <div className="flex items-center space-x-2">
            <button
              onClick={goToPrevious}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Anterior"
            >
              <ChevronLeft size={20} className="text-gray-600" />
            </button>
            <button
              onClick={goToToday}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                isToday(currentDate)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              Hoy
            </button>
            <button
              onClick={goToNext}
              className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              title="Siguiente"
            >
              <ChevronRight size={20} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* View Mode and Filters */}
        <div className="flex items-center justify-between">
          {/* View Mode Toggle */}
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => onViewModeChange(VIEW_MODES.DAILY)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === VIEW_MODES.DAILY
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Vista Diaria
              </button>
              <button
                onClick={() => onViewModeChange(VIEW_MODES.INDIVIDUAL)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === VIEW_MODES.INDIVIDUAL
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Vista Individual
              </button>
            </div>
            <button
              onClick={onConsoleClick}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors text-sm font-medium text-gray-700"
            >
              <Terminal size={18} />
              <span>Consola</span>
            </button>
          </div>

          {/* Machine Filter / Selector */}
          <div className="flex items-center space-x-3">
            {viewMode === VIEW_MODES.INDIVIDUAL ? (
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Máquina:</label>
                <select
                  value={individualMachine}
                  onChange={(e) => onIndividualMachineChange(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {MACHINE_IDS.map((machineId) => (
                    <option key={machineId} value={machineId}>
                      {machineId}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowMachineFilter(!showMachineFilter)}
                  className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                >
                  <Filter size={18} className="text-gray-600" />
                  <span className="text-sm font-medium text-gray-700">Filtrar Máquinas</span>
                </button>

                {showMachineFilter && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMachineFilter(false)}
                    ></div>
                    <div className="absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-20 min-w-[250px]">
                      <div className="text-sm font-semibold text-gray-700 mb-3">
                        Seleccionar Máquinas
                      </div>
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {MACHINE_IDS.map((machineId) => (
                          <label
                            key={machineId}
                            className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={selectedMachines.includes(machineId)}
                              onChange={() => onMachineToggle(machineId)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{machineId}</span>
                          </label>
                        ))}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <button
                          onClick={() => setShowMachineFilter(false)}
                          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                        >
                          Aplicar
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default CalendarHeader

