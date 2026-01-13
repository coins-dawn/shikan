'use client'

import { HelpContentItem } from '@/types'

interface HelpDialogProps {
  isOpen: boolean
  onClose: () => void
  position: 'left' | 'right'
  title: string
  content: HelpContentItem[]
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
    ? 'left-[calc(360px+2.5rem)]'
    : 'right-[calc(360px+2.5rem)]'

  const topClass = 'top-4'

  return (
    <div
      className={`absolute ${topClass} ${positionClasses} z-[60] transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0'
      }`}
      role="dialog"
      aria-labelledby="help-dialog-title"
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 w-80 max-h-[calc(100svh-151px)] overflow-hidden flex flex-col">
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
          {content.map((item, index) => {
            // 単一の文字列の場合は段落として表示
            if (typeof item === 'string') {
              return (
                <p key={index} className="text-sm text-gray-700 leading-relaxed">
                  {item}
                </p>
              )
            }

            // 段落グループの場合
            if (item.type === 'paragraph') {
              return (
                <div key={index} className={index == 0 ? '' : 'mt-2'}>
                  {item.items.map((text, i) => (
                    <p key={i} className="text-sm text-gray-700 leading-relaxed">
                      {text}
                    </p>
                  ))}
                </div>
              )
            }

            // 箇条書きリストの場合
            if (item.type === 'list') {
              return (
                <ul key={index} className="">
                  {item.items.map((text, i) => (
                    <li key={i} className="text-sm text-gray-700 leading-relaxed relative pl-[1.2em] -indent-[1.2em] before:content-['・']">
                      {text}
                    </li>
                  ))}
                </ul>
              )
            }

            return null
          })}
        </div>
      </div>
    </div>
  )
}
