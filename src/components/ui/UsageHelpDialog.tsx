'use client'

import { useEffect } from 'react'
import { HELP_CONTENT, HELP_SECTIONS } from '@/lib/constants/helpContent'
import { HelpContentItem } from '@/types'

interface UsageHelpDialogProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * 使い方の全画面モーダルダイアログ
 * モバイル表示時にhelpContent.tsの全セクションを表示
 */
export default function UsageHelpDialog({ isOpen, onClose }: UsageHelpDialogProps) {
  // ESCキーで閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  // モーダルが開いている間はbodyのスクロールを無効化
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  // コンテンツアイテムをレンダリングするヘルパー関数
  const renderContentItem = (item: HelpContentItem, index: number) => {
    // 単一の文字列の場合は段落として表示
    if (typeof item === 'string') {
      return (
        <p key={index} className="text-sm desktop:text-base text-gray-700 leading-relaxed">
          {item}
        </p>
      )
    }

    // 段落グループの場合
    if (item.type === 'paragraph') {
      return (
        <div key={index} className={index === 0 ? '' : 'mt-3 desktop:mt-4'}>
          {item.items.map((text, i) => (
            <p key={i} className="text-sm desktop:text-base text-gray-700 leading-relaxed font-semibold">
              {text}
            </p>
          ))}
        </div>
      )
    }

    // 箇条書きリストの場合
    if (item.type === 'list') {
      return (
        <ul key={index} className="mt-2">
          {item.items.map((text, i) => (
            <li
              key={i}
              className="text-sm desktop:text-base text-gray-700 leading-relaxed relative pl-[1.2em] -indent-[1.2em] before:content-['・']"
            >
              {text}
            </li>
          ))}
        </ul>
      )
    }

    return null
  }

  return (
    // オーバーレイ
    <div
      className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-labelledby="usage-help-dialog-title"
      aria-modal="true"
    >
      {/* ダイアログコンテンツ */}
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ヘッダー */}
        <div className="px-4 desktop:px-6 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
          <h2 id="usage-help-dialog-title" className="text-lg desktop:text-xl font-semibold text-gray-800">
            使い方
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors rounded hover:bg-gray-200"
            aria-label="閉じる"
          >
            ✕
          </button>
        </div>

        {/* スクロール可能なコンテンツエリア */}
        <div className="p-4 desktop:p-6 overflow-y-auto">
          {HELP_SECTIONS.map((section) => {
            const content = HELP_CONTENT[section.key]
            return (
              <div key={section.key} className="mb-8 last:mb-0">
                {/* セクションタイトル */}
                <h3 className="text-base desktop:text-lg font-semibold text-gray-800 mb-3 desktop:mb-4 pb-2 border-b border-gray-300">
                  {section.title}
                </h3>
                {/* セクションコンテンツ */}
                <div className="space-y-2">
                  {content.map((item, index) => renderContentItem(item, index))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
