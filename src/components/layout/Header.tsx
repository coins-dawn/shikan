'use client'

import { ScreenType } from '@/types'

interface HeaderProps {
  currentScreen: ScreenType
  onNavigate: (screen: ScreenType) => void
}

const steps: { id: ScreenType; label: string }[] = [
  { id: 'condition', label: '到達圏の条件設定' },
  { id: 'bus-simple', label: 'コミュニティバスの条件設定' },
  { id: 'result', label: '結果' },
]

export default function Header({ currentScreen, onNavigate }: HeaderProps) {
  const currentIndex = steps.findIndex((step) => step.id === currentScreen)

  return (
    <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
      {/* ロゴ */}
      <h1 className="text-lg font-bold text-gray-800">
        コミュニティバスを作ろう！
      </h1>

      {/* パンくずナビゲーション */}
      <nav className="flex items-center space-x-2">
        {steps.map((step, index) => {
          const isActive = step.id === currentScreen
          const isPast = index < currentIndex
          const isClickable = isPast

          return (
            <div key={step.id} className="flex items-center">
              {index > 0 && (
                <span className="mx-2 text-gray-300">/</span>
              )}
              <button
                onClick={() => isClickable && onNavigate(step.id)}
                disabled={!isClickable}
                className={`
                  text-sm px-2 py-1 rounded transition-colors
                  ${isActive
                    ? 'bg-blue-100 text-blue-700 font-medium'
                    : isPast
                      ? 'text-blue-600 hover:bg-blue-50 cursor-pointer'
                      : 'text-gray-400 cursor-not-allowed'
                  }
                `}
              >
                {step.label}
              </button>
            </div>
          )
        })}
      </nav>
    </header>
  )
}
