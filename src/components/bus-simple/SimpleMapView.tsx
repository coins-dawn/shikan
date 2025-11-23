'use client'

import dynamic from 'next/dynamic'
import {
  ReachabilityItem,
  Spot,
  ConditionState,
  BusConditionState,
  BusStop,
} from '@/types'
import BusConditionPanel from './BusConditionPanel'
import SummaryPanel from '@/components/condition/SummaryPanel'
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
const BusStopMarker = dynamic(
  () => import('@/components/bus/BusStopMarker'),
  { ssr: false }
)
const BusRoutePolyline = dynamic(
  () => import('@/components/bus/BusRoutePolyline'),
  { ssr: false }
)

interface SimpleMapViewProps {
  condition: ConditionState
  busCondition: BusConditionState
  reachability: ReachabilityItem | null
  spots: Spot[]
  selectedBusStops: BusStop[]
  isLoading: boolean
  loadingMessage: string
  onUpdateBusCondition: (updates: Partial<BusConditionState>) => void
  onNext: () => void
}

export default function SimpleMapView({
  condition,
  busCondition,
  reachability,
  spots,
  selectedBusStops,
  isLoading,
  loadingMessage,
  onUpdateBusCondition,
  onNext,
}: SimpleMapViewProps) {
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

        {/* バス停マーカー */}
        {selectedBusStops.map((stop) => (
          <BusStopMarker
            key={stop.id}
            stop={stop}
            isSelected={true}
            onSelect={() => {}}
          />
        ))}

        {/* バス経路（直線） */}
        {selectedBusStops.length >= 2 && (
          <BusRoutePolyline stops={selectedBusStops} />
        )}
      </Map>

      {/* 左パネル: バス生成条件 */}
      <BusConditionPanel
        busCondition={busCondition}
        onUpdate={onUpdateBusCondition}
        onNext={onNext}
      />

      {/* 右パネル: サマリ（前画面と同じ） */}
      <SummaryPanel condition={condition} reachability={reachability} />

      {/* ローディング */}
      {isLoading && <Loading message={loadingMessage} />}
    </div>
  )
}
