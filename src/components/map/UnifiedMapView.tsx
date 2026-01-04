'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import {
  ScreenType,
  ReachabilityItem,
  Spot,
  ConditionState,
  BusConditionState,
  BusStop,
  APIResponseWithScore,
} from '@/types'
import ConditionPanel from '@/components/condition/ConditionPanel'
import SummaryPanel from '@/components/condition/SummaryPanel'
import BusConditionPanel from '@/components/bus-simple/BusConditionPanel'
import BusStopDetailPanel from '@/components/result/BusStopDetailPanel'
import ResultSummaryPanel from '@/components/result/ResultSummaryPanel'
import SampleRoutePanel from '@/components/result/SampleRoutePanel'
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

interface UnifiedMapViewProps {
  // 画面状態
  currentScreen: ScreenType

  // 条件設定
  condition: ConditionState
  busCondition: BusConditionState

  // データ
  spotTypes: string[]
  reachability: ReachabilityItem | null
  spots: Spot[]
  selectedBusStops: BusStop[]
  searchResult: APIResponseWithScore | null

  // ローディング
  isLoading: boolean
  loadingMessage: string

  // イベントハンドラー
  onUpdateCondition: (updates: Partial<ConditionState>) => void
  onUpdateBusCondition: (updates: Partial<BusConditionState>) => void
  onNavigateToSimple: () => void
  onExecuteSearch: () => void
}

export default function UnifiedMapView({
  currentScreen,
  condition,
  busCondition,
  spotTypes,
  reachability,
  spots,
  selectedBusStops,
  searchResult,
  isLoading,
  loadingMessage,
  onUpdateCondition,
  onUpdateBusCondition,
  onNavigateToSimple,
  onExecuteSearch,
}: UnifiedMapViewProps) {
  // 結果画面のローカルステート
  const [showSampleRoute, setShowSampleRoute] = useState(false)

  // 結果画面用のデータ変換
  const combusData = searchResult?.result.combus ?? null
  const facilityResult =
    searchResult?.result.area[condition.selectedSpotType] ?? null
  const busStopsFromResult: BusStop[] =
    combusData?.['stop-list'].map((stop) => ({
      id: stop.id,
      name: stop.name,
      lat: stop.coord.lat,
      lng: stop.coord.lon,
    })) ?? []

  return (
    <div className="relative w-full h-full">
      {/* 地図（常に同一インスタンス） */}
      <Map>
        {/* === 到達圏ポリゴン - condition/bus-simple画面 === */}
        {(currentScreen === 'condition' || currentScreen === 'bus-simple') &&
          reachability && (
            <ReachabilityLayer
              key={`${condition.selectedSpotType}-${condition.maxMinute}`}
              data={reachability.polygon}
              color="#3b82f6"
              fillOpacity={0.3}
            />
          )}

        {/* === 到達圏ポリゴン - result画面（導入前） === */}
        {currentScreen === 'result' && facilityResult && (
          <ReachabilityLayer
            key="original"
            data={facilityResult.reachable.original}
            color="#3b82f6"
            fillOpacity={0.3}
          />
        )}

        {/* === 到達圏ポリゴン - result画面（導入後） === */}
        {currentScreen === 'result' && facilityResult && (
          <ReachabilityLayer
            key="with-combus"
            data={facilityResult.reachable['with-combus']}
            color="#10b981"
            fillOpacity={0.3}
          />
        )}

        {/* === スポットマーカー - 全画面共通 === */}
        {spots.map((spot) => (
          <SpotMarker key={spot.id} spot={spot} />
        ))}

        {/* === バス停マーカー - bus-simple画面 === */}
        {currentScreen === 'bus-simple' &&
          selectedBusStops.map((stop) => (
            <BusStopMarker
              key={stop.id}
              stop={stop}
              isSelected={true}
              onSelect={() => {}}
            />
          ))}

        {/* === バス経路 - bus-simple画面 === */}
        {currentScreen === 'bus-simple' && selectedBusStops.length >= 2 && (
          <BusRoutePolyline stops={selectedBusStops} />
        )}

        {/* === バス停マーカー - result画面 === */}
        {currentScreen === 'result' &&
          busStopsFromResult.map((stop) => (
            <BusStopMarker
              key={stop.id}
              stop={stop}
              isSelected={true}
              onSelect={() => {}}
            />
          ))}

        {/* === バス経路 - result画面 === */}
        {currentScreen === 'result' && busStopsFromResult.length >= 2 && (
          <BusRoutePolyline stops={busStopsFromResult} combusData={combusData} />
        )}
      </Map>

      {/* === 左パネル - 画面ごとに切り替え === */}
      {currentScreen === 'condition' && (
        <ConditionPanel
          condition={condition}
          spotTypes={spotTypes}
          onUpdate={onUpdateCondition}
          onNext={onNavigateToSimple}
        />
      )}

      {currentScreen === 'bus-simple' && (
        <BusConditionPanel
          busCondition={busCondition}
          onUpdate={onUpdateBusCondition}
          onNext={onExecuteSearch}
        />
      )}

      {currentScreen === 'result' && (
        <BusStopDetailPanel
          combusData={combusData}
          onShowSampleRoute={() => setShowSampleRoute(true)}
        />
      )}

      {/* === 右パネル - 画面ごとに切り替え === */}
      {(currentScreen === 'condition' || currentScreen === 'bus-simple') && (
        <SummaryPanel condition={condition} reachability={reachability} />
      )}

      {currentScreen === 'result' && (
        <ResultSummaryPanel
          condition={condition}
          reachability={reachability}
          facilityResult={facilityResult}
        />
      )}

      {/* === サンプル経路パネル - result画面のみ === */}
      {currentScreen === 'result' && (
        <SampleRoutePanel
          isOpen={showSampleRoute}
          onClose={() => setShowSampleRoute(false)}
        />
      )}

      {/* === ローディング === */}
      {isLoading && <Loading message={loadingMessage} />}
    </div>
  )
}
