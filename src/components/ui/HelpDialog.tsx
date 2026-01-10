'use client'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
  position: 'left' | 'right'
  title: string
  content: string[]
}

export default function HelpDialog({
  isOpen,
  onClose,
  position,
  title,
  content,
}: HelpDialogProps) {
  if (!isOpen) return null

  const positionClasses = position === 'left'
    ? 'left-[calc(320px+2rem)]'
    : 'right-[calc(320px+2rem)]'

  const topClass = position === 'left' ? 'top-24' : 'top-4'

  return (
    <div
      className={`absolute ${topClass} ${positionClasses} z-[60] transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-labelledby="help-dialog-title"
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <h3 id="help-dialog-title" className="text-sm font-medium text-gray-800">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto">
          <ul className="space-y-2">
            {content.map((item, index) => (
              <li key={index} className="text-sm text-gray-700 leading-relaxed">
                ・{item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
