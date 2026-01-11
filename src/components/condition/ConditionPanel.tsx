'use client'

import { ConditionState, Spot, ScreenType } from '@/types'
import Panel from '@/components/ui/Panel'

interface ConditionPanelProps {
  condition: ConditionState
  spots: Spot[]
  availableDepartureTimes: string[]
  onUpdate: (updates: Partial<ConditionState>) => void
  onNext: () => void
  currentScreen?: ScreenType
}

// 移動上限時間の選択肢（30〜90分、10分刻み）
const TIME_OPTIONS = Array.from({ length: 4 }, (_, i) => (i + 3) * 10)

// 徒歩距離上限の選択肢
const WALK_DISTANCE_OPTIONS = [500, 1000]

export default function ConditionPanel({
  condition,
  spots,
  availableDepartureTimes,
  onUpdate,
  onNext,
  currentScreen,
}: ConditionPanelProps) {
  const helpContent = [
    '選択された対象スポットの到達圏が地図上に表示されます',
    '移動上限時間、徒歩上限距離、出発時刻を設定できます',
    '条件の設定ができたら「次へ」ボタンを押すとコミュニティバスのルート作成画面に進みます',
  ]

  return (
    <Panel
      position="left"
      title="到達圏の条件設定"
      helpContent={helpContent}
      currentScreen={currentScreen}
    >
      <div className="space-y-4">
        {/* 対象スポット */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            対象スポット
          </label>
          <select
            value={condition.selectedSpotId}
            onChange={(e) => onUpdate({ selectedSpotId: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {spots.map((spot) => (
              <option key={spot.id} value={spot.id}>
                {spot.name}
              </option>
            ))}
          </select>
        </div>

        {/* 移動上限時間 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            移動上限時間
          </label>
          <select
            value={condition.maxMinute}
            onChange={(e) => onUpdate({ maxMinute: Number(e.target.value) })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {TIME_OPTIONS.map((time) => (
              <option key={time} value={time}>
                {time}分
              </option>
            ))}
          </select>
        </div>

        {/* 徒歩上限距離 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            徒歩上限距離
          </label>
          <select
            value={condition.walkingDistance}
            onChange={(e) =>
              onUpdate({ walkingDistance: Number(e.target.value) })
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {WALK_DISTANCE_OPTIONS.map((distance) => (
              <option key={distance} value={distance}>
                {distance}m
              </option>
            ))}
          </select>
        </div>

        {/* 出発時刻 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            出発時刻
          </label>
          <select
            value={condition.departureTime}
            onChange={(e) => onUpdate({ departureTime: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            {availableDepartureTimes.map((time) => (
              <option key={time} value={time}>
                {time}
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
