'use client'

import { ScreenType } from '@/types'

interface HeaderProps {
  currentScreen: ScreenType
}

export default function Header({ currentScreen }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-bold text-gray-800">
          コミバスをつくろう！
        </h1>
        <a
          href="/about"
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
        >
          このサイトについて
        </a>
      </div>
    </header>
  )
}
