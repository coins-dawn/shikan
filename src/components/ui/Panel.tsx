'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ScreenType } from '@/types'
import HelpDialog from './HelpDialog'

interface PanelProps {
  children: ReactNode
  position: 'left' | 'right'
  title?: string
  defaultOpen?: boolean
  helpContent?: string[]
  currentScreen?: ScreenType
}

export default function Panel({
  children,
  position,
  title,
  defaultOpen = true,
  helpContent,
  currentScreen,
}: PanelProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen)
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  // 画面遷移時にヘルプダイアログを閉じる
  useEffect(() => {
    setIsHelpOpen(false)
  }, [currentScreen])

  // パネル開閉時にヘルプダイアログを閉じる
  useEffect(() => {
    if (!isOpen) {
      setIsHelpOpen(false)
    }
  }, [isOpen])

  const positionClasses = position === 'left' ? 'left-4' : 'right-4'
  const toggleButtonPosition = position === 'left' ? '-right-8' : '-left-8'
  const toggleIcon = position === 'left'
    ? (isOpen ? '◀' : '▶')
    : (isOpen ? '▶' : '◀')

  return (
    <div
      className={`
        absolute ${position === 'right' ? 'top-4' : 'top-20'} ${positionClasses} z-[50]
        transition-transform duration-300 ease-in-out
        ${!isOpen && (position === 'left' ? '-translate-x-[calc(100%+1rem)]' : 'translate-x-[calc(100%+1rem)]')}
      `}
    >
      <div className="bg-white rounded-lg shadow-lg w-80 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
        {/* ヘッダー */}
        {title && (
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
            <h2 className="font-medium text-gray-800">{title}</h2>
            {helpContent && (
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-sm transition-colors"
                aria-label="ヘルプ"
              >
                ?
              </button>
            )}
          </div>
        )}

        {/* コンテンツ */}
        <div className="p-4 overflow-y-auto flex-1">
          {children}
        </div>
      </div>

      {/* 開閉ボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          absolute top-1/2 -translate-y-1/2 ${toggleButtonPosition}
          w-6 h-12 bg-white rounded shadow-md
          flex items-center justify-center
          text-gray-500 hover:text-gray-700 hover:bg-gray-50
          transition-colors text-xs
        `}
      >
        {toggleIcon}
      </button>

      {/* ヘルプダイアログ */}
      {helpContent && title && (
        <HelpDialog
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          position={position}
          title={`${title}について`}
          content={helpContent}
        />
      )}
    </div>
  )
}
