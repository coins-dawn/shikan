'use client'

import { BusConditionState } from '@/types'
import Panel from '@/components/ui/Panel'

interface BusConditionPanelProps {
  busCondition: BusConditionState
  onUpdate: (updates: Partial<BusConditionState>) => void
  onNext: () => void
}

// 周回所要時間の選択肢（60〜120分、10分刻み）
const TIME_OPTIONS = Array.from({ length: 7 }, (_, i) => (i + 6) * 10)

export default function BusConditionPanel({
  busCondition,
  onUpdate,
  onNext,
}: BusConditionPanelProps) {
  return (
    <Panel position="left" title="コミュニティバスの条件設定">
      <div className="space-y-4">
        {/* 周回所要時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            周回所要時間を選択
          </label>
          <select
            value={busCondition.roundTripTime}
            onChange={(e) =>
              onUpdate({ roundTripTime: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}分
              </option>
            ))}
          </select>
        </div>

        {/* 次へボタン */}
        <button
          onClick={onNext}
          className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          次へ
        </button>
      </div>
    </Panel>
  )
}
