'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ScreenType, HelpContentItem } from '@/types'
import HelpDialog from './HelpDialog'

interface PanelProps {
  children: ReactNode
  position: 'left' | 'right'
  title?: string
  defaultOpen?: boolean
  helpContent?: HelpContentItem[]
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

  // アイコンSVGコンポーネント
  const LeftArrow = () => (
    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="gray">
      <path d="M15 5 L7 12 L15 19 Z" />
    </svg>
  )

  const RightArrow = () => (
    <svg className="w-4 h-4 text-gray-600" viewBox="0 0 24 24" fill="gray">
      <path d="M9 5 L17 12 L9 19 Z" />
    </svg>
  )

  return (
    <>
      {/* === デスクトップレイアウト === */}
      <div
        className={`
          hidden desktop:block
          absolute z-[50]
          ${position === 'left' ? 'left-4 top-20' : 'right-4 top-4'}
          w-90
          transition-transform duration-300 ease-in-out
          ${!isOpen && position === 'left' ? '-translate-x-[calc(100%+1rem)]' : ''}
          ${!isOpen && position === 'right' ? 'translate-x-[calc(100%+1rem)]' : ''}
        `}
      >
        <div className="bg-white rounded-lg shadow-lg w-full flex flex-col">
          {/* ヘッダー */}
          {title && (
            <div className="p-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
              <h2 className="font-medium text-gray-800">{title}</h2>
              {/* ヘルプボタン */}
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
          <div className="bg-white p-4 overflow-y-auto flex-1 max-h-[calc(100svh-12.5rem)]">
            {children}
          </div>
        </div>

        {/* 開閉ボタン（デスクトップ） */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`
            absolute top-1/2 -translate-y-1/2
            ${position === 'left' ? '-right-8' : '-left-8'}
            w-6 h-12 bg-white rounded shadow-md
            flex items-center justify-center
            text-gray-500 hover:text-gray-700 hover:bg-gray-50
            transition-colors text-xs
          `}
        >
          {position === 'left' ? (isOpen ? <LeftArrow /> : <RightArrow />) : (isOpen ? <RightArrow /> : <LeftArrow />)}
        </button>
      </div>

      {/* === モバイルレイアウト === */}
      <div
        className={`
          block desktop:hidden
          absolute z-[50]
          ${position === 'left' ? 'left-0 bottom-0' : 'right-0 top-10'}
          w-full
          transition-transform duration-300 ease-in-out
          ${!isOpen && position === 'left' ? 'translate-y-[calc(100%-2.75rem)]' : ''}
          ${!isOpen && position === 'right' ? 'pointer-events-none' : ''}
        `}
      >
        <div className={`${position === 'left' ? 'bg-white shadow-lg' : ''} w-full flex flex-col`}>
          {/* ヘッダー */}
          {title && (
            <div className={`px-3 py-2 z-50 border-b border-gray-200 bg-gray-50 flex items-center justify-between ${!isOpen && position === 'right' ? 'pointer-events-auto' : ''}`}>
              <h2 className="font-medium text-gray-800">{title}</h2>
              {/* 開閉ボタン（モバイル） */}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="パネルを閉じる"
              >
                {position === 'left' ? (isOpen ? <LeftArrow /> : <RightArrow />) : (isOpen ? <RightArrow /> : <LeftArrow />)}
              </button>
            </div>
          )}

          {/* コンテンツ */}
          <div
            className={`
              bg-white shadow-lg
              p-4 overflow-y-auto flex-1
              ${position === 'left' ? 'max-h-[calc(100svh-520px)]' : 'max-h-[calc(100svh-12.5rem)]'}
              transition-transform duration-300 ease-in-out
              ${!isOpen && position === 'right' ? '-translate-y-full' : ''}
              ${!isOpen && position === 'right' ? 'pointer-events-none' : ''}
            `}
          >
            {children}
          </div>
        </div>
      </div>

      {/* ヘルプダイアログ */}
      {helpContent && title && (
        <HelpDialog
          isOpen={isHelpOpen}
          onClose={() => setIsHelpOpen(false)}
          position={position}
          title={`${title == "コミュニティバスの条件設定（手動）" ? "手動設定" : title}について`}
          content={helpContent}
        />
      )}
    </>
  )
}
