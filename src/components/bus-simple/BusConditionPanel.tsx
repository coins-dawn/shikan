'use client'

import { StopSequence, ScreenType } from '@/types'
import Panel from '@/components/ui/Panel'

interface BusConditionPanelProps {
  allRoutes: StopSequence[]
  selectedRouteIndex: number
  onSelectRoute: (index: number) => void
  onNext: () => void
  onSwitchToManual: () => void
  onBack: () => void
  currentScreen?: ScreenType
}

export default function BusConditionPanel({
  allRoutes,
  selectedRouteIndex,
  onSelectRoute,
  onNext,
  onSwitchToManual,
  onBack,
  currentScreen,
}: BusConditionPanelProps) {
  const helpContent = [
    'サービスが自動で生成したルートを提案します',
    '手動でルートを作成したい場合は「手動設定する」リンクを押下すると手動設定画面に遷移します',
    '「次へ」ボタンを押すとコミュニティバスが導入された場合の到達圏の変化を見ることができます',
  ]

  return (
    <Panel
      position="left"
      title="コミュニティバスの条件設定"
      helpContent={helpContent}
      currentScreen={currentScreen}
    >
      <div className="space-y-4">
        {/* ルート選択 */}
        {allRoutes.length > 1 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ルートを選択
            </label>
            <select
              value={selectedRouteIndex}
              onChange={(e) => onSelectRoute(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {allRoutes.map((route, index) => (
                <option key={index} value={index}>
                  ルート{index + 1}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* 手動設定するリンク */}
        <button
          onClick={onSwitchToManual}
          className="w-full text-sm text-blue-600 hover:text-blue-700 underline text-center"
        >
          手動設定する
        </button>

        {/* 次へボタン */}
        <button
          onClick={onNext}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          次へ
        </button>

        {/* 到達圏の条件設定に戻るボタン */}
        <button
          onClick={onBack}
          className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
        >
          戻る
        </button>
      </div>
    </Panel>
  )
}
