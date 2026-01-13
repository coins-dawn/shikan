'use client'

import { useState, useRef, useEffect } from 'react'

interface HeaderMenuProps {
  onUsageClick: () => void
}

/**
 * モバイル用ヘッダーメニュー（ハンバーガーアイコン + ドロップダウン）
 * このサイトについてリンクと使い方リンクを提供
 */
export default function HeaderMenu({ onUsageClick }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // 外側クリックで閉じる
  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleUsageClick = () => {
    setIsOpen(false)
    onUsageClick()
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* ハンバーガーメニューアイコンボタン */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
        aria-label="メニュー"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* 三本線アイコン */}
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      </button>

      {/* ドロップダウンメニュー */}
      {isOpen && (
        <div
          className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[70]"
          role="menu"
          aria-orientation="vertical"
        >
          {/* このサイトについてリンク */}
          <a
            href="/about"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            role="menuitem"
            onClick={() => setIsOpen(false)}
          >
            このサイトについて
          </a>

          {/* 使い方リンク */}
          <button
            onClick={handleUsageClick}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
            role="menuitem"
          >
            使い方
          </button>
        </div>
      )}
    </div>
  )
}
