'use client'

import dynamic from 'next/dynamic'
import { ReachabilityItem, Spot, ConditionState } from '@/types'
import ConditionPanel from './ConditionPanel'
import SummaryPanel from './SummaryPanel'
import Loading from '@/components/ui/Loading'

// Leaflet コンポーネントは動的インポート（SSR無効化）
const Map = dynamic(() => import('@/components/map/Map'), { ssr: false })
const ReachabilityLayer = dynamic(
  () => import('@/components/layer/ReachabilityLayer'),
  { ssr: false }
)
const SpotMarker = dynamic(() => import('@/components/layer/SpotMarker'), {
  ssr: false,
})

interface ConditionMapViewProps {
  condition: ConditionState
  spotTypes: string[]
  reachability: ReachabilityItem | null
  spots: Spot[]
  isLoading: boolean
  loadingMessage: string
  onUpdateCondition: (updates: Partial<ConditionState>) => void
  onNext: () => void
}

export default function ConditionMapView({
  condition,
  spotTypes,
  reachability,
  spots,
  isLoading,
  loadingMessage,
  onUpdateCondition,
  onNext,
}: ConditionMapViewProps) {
  return (
    <div className="relative w-full h-full">
      {/* 地図 */}
      <Map>
        {/* 到達圏ポリゴン */}
        {reachability && (
          <ReachabilityLayer
            key={`${condition.selectedSpotType}-${condition.maxMinute}`}
            data={reachability.polygon}
            color="#3b82f6"
            fillOpacity={0.3}
          />
        )}

        {/* スポットマーカー */}
        {spots.map((spot) => (
          <SpotMarker key={spot.id} spot={spot} />
        ))}
      </Map>

      {/* 左パネル: 条件設定 */}
      <ConditionPanel
        condition={condition}
        spotTypes={spotTypes}
        onUpdate={onUpdateCondition}
        onNext={onNext}
      />

      {/* 右パネル: サマリ */}
      <SummaryPanel condition={condition} reachability={reachability} />

      {/* ローディング */}
      {isLoading && <Loading message={loadingMessage} />}
    </div>
  )
}
