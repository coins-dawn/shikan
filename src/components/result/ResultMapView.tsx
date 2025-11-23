'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ReachabilityItem,
  Spot,
  ConditionState,
  APIResponseWithScore,
  BusStop,
} from '@/types'
import BusStopDetailPanel from './BusStopDetailPanel'
import ResultSummaryPanel from './ResultSummaryPanel'
import SampleRoutePanel from './SampleRoutePanel'
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

interface ResultMapViewProps {
  condition: ConditionState
  reachability: ReachabilityItem | null
  spots: Spot[]
  searchResult: APIResponseWithScore | null
  isLoading: boolean
  loadingMessage: string
}

export default function ResultMapView({
  condition,
  reachability,
  spots,
  searchResult,
  isLoading,
  loadingMessage,
}: ResultMapViewProps) {
  const [showSampleRoute, setShowSampleRoute] = useState(false)

  const combusData = searchResult?.result.combus ?? null
  const facilityResult =
    searchResult?.result.area[condition.selectedSpotType] ?? null

  // CombusDataのstop-listからBusStop配列に変換
  const busStops: BusStop[] =
    combusData?.['stop-list'].map((stop) => ({
      id: stop.id,
      name: stop.name,
      lat: stop.coord.lat,
      lng: stop.coord.lon,
    })) ?? []

  return (
    <div className="relative w-full h-full">
      {/* 地図 */}
      <Map>
        {/* 元の到達圏ポリゴン */}
        {facilityResult && (
          <ReachabilityLayer
            data={facilityResult.reachable.original}
            color="#3b82f6"
            fillOpacity={0.3}
          />
        )}

        {/* コミュニティバス導入後の到達圏ポリゴン */}
        {facilityResult && (
          <ReachabilityLayer
            data={facilityResult.reachable['with-combus']}
            color="#10b981"
            fillOpacity={0.3}
          />
        )}

        {/* スポットマーカー */}
        {spots.map((spot) => (
          <SpotMarker key={spot.id} spot={spot} />
        ))}

        {/* バス停マーカー */}
        {busStops.map((stop) => (
          <BusStopMarker
            key={stop.id}
            stop={stop}
            isSelected={true}
            onSelect={() => {}}
          />
        ))}

        {/* バス経路 */}
        {busStops.length >= 2 && (
          <BusRoutePolyline stops={busStops} combusData={combusData} />
        )}
      </Map>

      {/* 左パネル: バス停詳細 */}
      <BusStopDetailPanel
        combusData={combusData}
        onShowSampleRoute={() => setShowSampleRoute(true)}
      />

      {/* サンプル経路パネル（バス停詳細の右側） */}
      <SampleRoutePanel
        isOpen={showSampleRoute}
        onClose={() => setShowSampleRoute(false)}
      />

      {/* 右パネル: 結果サマリ */}
      <ResultSummaryPanel
        condition={condition}
        reachability={reachability}
        facilityResult={facilityResult}
      />

      {/* ローディング */}
      {isLoading && <Loading message={loadingMessage} />}
    </div>
  )
}
