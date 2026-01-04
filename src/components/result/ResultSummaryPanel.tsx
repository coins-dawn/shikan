'use client'

import {
  ConditionState,
  ReachabilityItem,
  FacilityReachabilityWithScore,
  Spot,
} from '@/types'
import Panel from '@/components/ui/Panel'

interface ResultSummaryPanelProps {
  condition: ConditionState
  reachability: ReachabilityItem | null
  facilityResult: FacilityReachabilityWithScore | null
  spots: Spot[]
}

export default function ResultSummaryPanel({
  condition,
  reachability,
  facilityResult,
  spots,
}: ResultSummaryPanelProps) {
  const selectedSpot = spots.find((s) => s.id === condition.selectedSpotId)
  const originalScore = facilityResult?.reachable['original-score'] ?? 0
  // with-combus-scoreは増加分を表す
  const increase = facilityResult?.reachable['with-combus-score'] ?? 0
  const increaseRate = facilityResult?.reachable['with-combus-score-rate'] ?? 0
  // 導入後の人口 = 導入前 + 増加分
  const totalAfterCombus = originalScore + increase

  return (
    <Panel position="right" title="結果サマリ">
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
        </div>

        {/* 区切り線 */}
        <hr className="border-gray-200" />

        {/* コミュニティバス導入前 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">導入前の到達可能人口</div>
          {reachability ? (
            <div className="text-lg font-bold text-gray-700">
              {originalScore.toLocaleString()}人
            </div>
          ) : (
            <div className="text-gray-400">データなし</div>
          )}
        </div>

        {/* 区切り線 */}
        <hr className="border-gray-200" />

        {/* コミュニティバス導入後 */}
        <div>
          <div className="text-sm text-gray-600 mb-1">導入後の到達可能人口</div>
          {facilityResult ? (
            <>
              <div className="text-2xl font-bold text-blue-600">
                {totalAfterCombus.toLocaleString()}人
              </div>
            </>
          ) : (
            <div className="text-gray-400">データなし</div>
          )}
        </div>

        {/* 増加量 */}
        {facilityResult && (
          <div className="bg-green-50 rounded-lg p-3">
            <div className="text-sm text-green-700 mb-1">人口増加</div>
            <div className="text-xl font-bold text-green-600">
              +{increase.toLocaleString()}人
            </div>
            <div className="text-sm text-green-600">
              (+{increaseRate}%)
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
