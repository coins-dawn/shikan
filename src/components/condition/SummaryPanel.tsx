'use client'

import { ConditionState, ReachabilityItem, Spot, ScreenType } from '@/types'
import Panel from '@/components/ui/Panel'

interface SummaryPanelProps {
  condition: ConditionState
  reachability: ReachabilityItem | null
  spots: Spot[]
  currentScreen?: ScreenType
}

export default function SummaryPanel({
  condition,
  reachability,
  spots,
  currentScreen,
}: SummaryPanelProps) {
  const selectedSpot = spots.find((s) => s.id === condition.selectedSpotId)

  const helpContent = [
    '到達圏の条件設定画面で設定した条件とその条件の時の到達可能人口が表示されます',
  ]

  return (
    <Panel
      position="right"
      title="サマリ"
      helpContent={helpContent}
      currentScreen={currentScreen}
    >
      <div className="space-y-3">
        {/* 選択条件 */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">対象スポット</span>
            <span className="font-medium">{selectedSpot?.name || '-'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">移動上限時間</span>
            <span className="font-medium">{condition.maxMinute}分</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">徒歩上限距離</span>
            <span className="font-medium">{condition.walkingDistance}m</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">出発時刻</span>
            <span className="font-medium">{condition.departureTime || '-'}</span>
          </div>
        </div>

        {/* 区切り線 */}
        <hr className="border-gray-200" />

        {/* 到達可能人口 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">到達可能人口</div>
          {reachability ? (
            <div className="text-2xl font-bold text-blue-600">
              {reachability.score.toLocaleString()}人
            </div>
          ) : (
            <div className="text-gray-400">データなし</div>
          )}
        </div>
      </div>
    </Panel>
  )
}
