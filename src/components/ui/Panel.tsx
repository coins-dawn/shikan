'use client'

import { useState, useEffect, ReactNode } from 'react'
import { ScreenType, HelpContentItem } from '@/types'
import HelpDialog from './HelpDialog'
import { useMediaQuery } from '@/hooks/useMediaQuery'

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
  const isDesktop = useMediaQuery('(min-width: 790px)')
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

  const toggleButtonPosition = position === 'left' ? '-right-8' : '-left-8'
  const positionX = position === 'left'
    ? isDesktop
      ? 'left-4'
      : 'left-0'
    : isDesktop
      ? 'right-4'
      : 'right-0'
  const positionY = position === 'left'
    ? isDesktop
      ? 'top-20'
      : 'bottom-0'
      : isDesktop
      ? 'top-4'
      : 'top-10'
  const toggleIcon = position === 'left'
    ? isOpen
      ?
      <svg
        className="w-4 h-4 text-gray-600"
        viewBox="0 0 24 24"
        fill="gray"
      >
        <path d="M15 5 L7 12 L15 19 Z" />
      </svg>
      :
      <svg
        className="w-4 h-4 text-gray-600"
        viewBox="0 0 24 24"
        fill="gray"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9 5 L17 12 L9 19 Z" />
      </svg>
    : isOpen
      ?
      <svg
        className="w-4 h-4 text-gray-600"
        viewBox="0 0 24 24"
        fill="gray"
      >
        <path d="M9 5 L17 12 L9 19 Z" />
      </svg>
      :
      <svg
        className="w-4 h-4 text-gray-600"
        viewBox="0 0 24 24"
        fill="gray"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M15 5 L7 12 L15 19 Z" />
      </svg>



  // パネル全体の移動量を計算（デスクトップ & モバイル左パネル用）
  const panelTranslate = !isOpen && isDesktop && position === 'left'
    ? '-translate-x-[calc(100%+1rem)]'
    : !isOpen && isDesktop && position === 'right'
    ? 'translate-x-[calc(100%+1rem)]'
    : !isOpen && !isDesktop && position === 'left'
    ? 'translate-y-[calc(100%-2.75rem)]' // 左パネル: ヘッダー高さ分だけ残して下に移動
    : ''

  // コンテンツのみの移動量を計算（モバイル右パネル用）
  const contentOnlyTranslate = !isOpen && !isDesktop && position === 'right'
    ? '-translate-y-full' // 右パネル: コンテンツだけ上に完全に隠す
    : ''

  return (
    <div
      className={`
        absolute ${positionX} ${positionY} z-[50]
        transition-transform duration-300 ease-in-out
        ${panelTranslate}
        ${isDesktop ? 'w-90' : 'w-full'}
        ${!isOpen && !isDesktop && position === 'right' ? 'pointer-events-none' : ''}
      `}
    >
      <div className={`${isDesktop || position === 'left' ? 'bg-white' : ''} ${isDesktop ? 'rounded-lg' : ''} ${isDesktop || position === 'left' ? 'shadow-lg' : ''} w-full flex flex-col`}>
        {/* ヘッダー */}
        {title && (
          <div className={`${isDesktop ? 'p-3' : 'px-3 py-2 z-50'} border-b border-gray-200 bg-gray-50 flex items-center justify-between ${!isOpen && !isDesktop && position === 'right' ? 'pointer-events-auto' : ''}`}>
            <h2 className="font-medium text-gray-800">{title}</h2>
            {/* デスクトップ時のみヘルプボタン表示 */}
            {isDesktop && helpContent && (
              <button
                onClick={() => setIsHelpOpen(!isHelpOpen)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-sm transition-colors"
                aria-label="ヘルプ"
              >
                ?
              </button>
            )}
            {/* モバイル時のみ開閉ボタン表示 */}
            {!isDesktop && (
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 transition-colors"
                aria-label="パネルを閉じる"
              >
                {toggleIcon}
              </button>
            )}
          </div>
        )}

        {/* コンテンツ（右パネル時のみ個別アニメーション） */}
        <div
          className={`
            bg-white shadow-lg
            p-4 overflow-y-auto flex-1
            ${!isDesktop && position === 'left' ? 'max-h-[calc(100vh-520px)]' : 'max-h-[calc(100vh-12.5rem)]'}
            transition-transform duration-300 ease-in-out
            ${contentOnlyTranslate}
            ${!isOpen && !isDesktop && position === 'right' ? 'pointer-events-none' : ''}
          `}
        >
          {children}
        </div>
      </div>

      {/* デスクトップ時のみ開閉ボタン表示 */}
      {isDesktop && (
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
      )}

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
    </div>
  )
}
