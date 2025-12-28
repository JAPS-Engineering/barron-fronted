import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

function ConsoleModal({ isOpen, onClose, logs = [] }) {
  const consoleRef = useRef(null)

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (consoleRef.current && isOpen) {
      consoleRef.current.scrollTop = consoleRef.current.scrollHeight
    }
  }, [logs, isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black bg-opacity-50" onClick={onClose}>
      <div 
        className="w-full max-w-6xl h-full max-h-[95vh] sm:max-h-[90vh] flex flex-col bg-[#2d1b1b] rounded-lg shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-3 bg-[#1a0f0f] border-b border-[#3d2a2a]">
          <div className="flex items-center space-x-2 flex-1 min-w-0">
            <div className="flex space-x-1.5 sm:space-x-2 flex-shrink-0">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ff5f56]"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#ffbd2e]"></div>
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full bg-[#27c93f]"></div>
            </div>
            <span className="ml-2 sm:ml-4 text-[#d4a574] text-xs sm:text-sm font-mono truncate">
              jeanf@DESKTOP-3OUGH1B: ~/japs/barron/barron-backend
            </span>
          </div>
          <button
            onClick={onClose}
            className="ml-2 p-1 hover:bg-[#3d2a2a] rounded transition-colors flex-shrink-0"
            aria-label="Cerrar consola"
          >
            <X size={16} className="sm:w-[18px] sm:h-[18px] text-[#d4a574]" />
          </button>
        </div>

        {/* Terminal Content */}
        <div
          ref={consoleRef}
          className="flex-1 overflow-y-auto p-3 sm:p-4 font-mono text-xs sm:text-sm text-white leading-relaxed"
          style={{
            backgroundColor: '#2d1b1b',
            fontFamily: "'Ubuntu Mono', 'Courier New', monospace"
          }}
        >
          {logs.length === 0 ? (
            <div className="text-[#8b7355]">Cargando logs...</div>
          ) : (
            logs.map((line, index) => {
              // Detect different types of lines for styling
              const isSeparator = line.trim().startsWith('=') || line.trim() === ''
              const isHeader = line.includes('PROGRAMA') || line.includes('VISTA') || line.includes('RESUMEN')
              const isSuccess = line.includes('EXITOSAMENTE') || line.includes('a tiempo')
              const isInfo = line.includes('📋') || line.includes('⏱️') || line.includes('🏭')
              const isWarning = line.includes('⚠️') || line.includes('Cantidad total extra')
              const isError = line.includes('ERROR') || line.includes('❌')
              const isSaved = line.includes('guardado en:')

              let lineClass = 'text-white'
              if (isSeparator) {
                lineClass = 'text-[#8b7355]'
              } else if (isHeader) {
                lineClass = 'text-[#ffbd2e] font-semibold'
              } else if (isSuccess) {
                lineClass = 'text-[#27c93f]'
              } else if (isInfo) {
                lineClass = 'text-[#5dade2]'
              } else if (isWarning) {
                lineClass = 'text-[#ffbd2e]'
              } else if (isError) {
                lineClass = 'text-[#ff5f56]'
              } else if (isSaved) {
                lineClass = 'text-[#5dade2]'
              }

              return (
                <div key={index} className={lineClass} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                  {line || '\u00A0'}
                </div>
              )
            })
          )}
        </div>

        {/* Terminal Footer */}
        <div className="px-3 sm:px-4 py-2 bg-[#1a0f0f] border-t border-[#3d2a2a]">
          <div className="flex items-center space-x-2 text-[#8b7355] text-xs font-mono">
            <span>$</span>
            <span className="animate-pulse">▊</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConsoleModal

