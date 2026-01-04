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
import { MapCenter } from '@/lib/api/targetRegion'
import ConditionPanel from '@/components/condition/ConditionPanel'
import SummaryPanel from '@/components/condition/SummaryPanel'
import BusConditionPanel from '@/components/bus-simple/BusConditionPanel'
import BusManualPanel from '@/components/bus-manual/BusManualPanel'
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
  allSpots: Spot[]
  reachability: ReachabilityItem | null
  spots: Spot[]
  selectedBusStops: BusStop[]
  manualBusStops: BusStop[]
  allBusStops: BusStop[]
  searchResult: APIResponseWithScore | null
  mapCenter: MapCenter | null

  // ローディング
  isLoading: boolean
  loadingMessage: string

  // イベントハンドラー
  onUpdateCondition: (updates: Partial<ConditionState>) => void
  onUpdateBusCondition: (updates: Partial<BusConditionState>) => void
  onNavigateToSimple: () => void
  onNavigateToManual: () => void
  onExecuteSearch: () => void
  onToggleManualBusStop: (stopId: string) => void
  onUpdateManualBusStops: (stopIds: string[]) => void
}

export default function UnifiedMapView({
  currentScreen,
  condition,
  busCondition,
  allSpots,
  reachability,
  spots,
  selectedBusStops,
  manualBusStops,
  allBusStops,
  searchResult,
  mapCenter,
  isLoading,
  loadingMessage,
  onUpdateCondition,
  onUpdateBusCondition,
  onNavigateToSimple,
  onNavigateToManual,
  onExecuteSearch,
  onToggleManualBusStop,
  onUpdateManualBusStops,
}: UnifiedMapViewProps) {
  // 結果画面のローカルステート
  const [showSampleRoute, setShowSampleRoute] = useState(false)

  // 結果画面用のデータ変換
  const combusData = searchResult?.result.combus ?? null
  const facilityResult = searchResult?.result.area ?? null
  const busStopsFromResult: BusStop[] =
    combusData?.['stop-list'].map((stop) => ({
      id: stop.id,
      name: stop.name,
      lat: stop.coord.lat,
      lng: stop.coord.lon,
    })) ?? []

  return (
    <div className="relative w-full h-full">
      {/* 地図（常に同一インスタンス）- mapCenter取得後にマウント */}
      {mapCenter && <Map center={[mapCenter.lat, mapCenter.lng]}>
        {/* === 到達圏ポリゴン - condition/bus-simple/bus-manual画面 === */}
        {(currentScreen === 'condition' ||
          currentScreen === 'bus-simple' ||
          currentScreen === 'bus-manual') &&
          reachability && (
            <ReachabilityLayer
              key={`${condition.selectedSpotId}-${condition.maxMinute}-${condition.walkingDistance}`}
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

        {/* === 全バス停マーカー - bus-manual画面 === */}
        {currentScreen === 'bus-manual' &&
          allBusStops.map((stop) => {
            const selectedIndex = manualBusStops.findIndex((s) => s.id === stop.id)
            const isSelected = selectedIndex >= 0

            return (
              <BusStopMarker
                key={stop.id}
                stop={stop}
                isSelected={isSelected}
                selectionOrder={isSelected ? selectedIndex + 1 : undefined}
                onSelect={() => onToggleManualBusStop(stop.id)}
                onDeselect={() => onToggleManualBusStop(stop.id)}
              />
            )
          })}

        {/* === バス経路 - bus-manual画面 === */}
        {currentScreen === 'bus-manual' && manualBusStops.length >= 2 && (
          <BusRoutePolyline stops={manualBusStops} />
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
      </Map>}

      {/* === 左パネル - 画面ごとに切り替え === */}
      {currentScreen === 'condition' && (
        <ConditionPanel
          condition={condition}
          spots={allSpots}
          onUpdate={onUpdateCondition}
          onNext={onNavigateToSimple}
        />
      )}

      {currentScreen === 'bus-simple' && (
        <BusConditionPanel
          busCondition={busCondition}
          onUpdate={onUpdateBusCondition}
          onNext={onExecuteSearch}
          onSwitchToManual={onNavigateToManual}
        />
      )}

      {currentScreen === 'bus-manual' && (
        <BusManualPanel
          selectedStops={manualBusStops}
          onReorder={onUpdateManualBusStops}
          onDeselect={onToggleManualBusStop}
          onNext={onExecuteSearch}
          onBackToSimple={onNavigateToSimple}
        />
      )}

      {currentScreen === 'result' && (
        <BusStopDetailPanel
          combusData={combusData}
          onShowSampleRoute={() => setShowSampleRoute(true)}
        />
      )}

      {/* === 右パネル - 画面ごとに切り替え === */}
      {(currentScreen === 'condition' ||
        currentScreen === 'bus-simple' ||
        currentScreen === 'bus-manual') && (
        <SummaryPanel
          condition={condition}
          reachability={reachability}
          spots={allSpots}
        />
      )}

      {currentScreen === 'result' && (
        <ResultSummaryPanel
          condition={condition}
          reachability={reachability}
          facilityResult={facilityResult}
          spots={allSpots}
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
