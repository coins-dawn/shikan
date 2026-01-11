'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import {
  ScreenType,
  ReachabilityItem,
  Spot,
  ConditionState,
  BusConditionState,
  BusStop,
  APIResponseWithScore,
  StopSequence,
  PublicTransitResponse,
  PopulationGeoJSON,
} from '@/types'
import { MapCenter } from '@/lib/api/targetRegion'
import ConditionPanel from '@/components/condition/ConditionPanel'
import SummaryPanel from '@/components/condition/SummaryPanel'
import BusConditionPanel from '@/components/bus-simple/BusConditionPanel'
import BusManualPanel from '@/components/bus-manual/BusManualPanel'
import BusStopDetailPanel from '@/components/result/BusStopDetailPanel'
import ResultSummaryPanel from '@/components/result/ResultSummaryPanel'
import Loading from '@/components/ui/Loading'
import LayerControlPanel from '@/components/map/LayerControlPanel'

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
const PublicTransitLayer = dynamic(
  () => import('@/components/layer/PublicTransitLayer'),
  { ssr: false }
)
const PopulationMeshLayer = dynamic(
  () => import('@/components/layer/PopulationMeshLayer'),
  { ssr: false }
)
const SampleRoutePolyline = dynamic(
  () => import('@/components/layer/SampleRoutePolyline'),
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
  allRoutes: StopSequence[]
  busStopsData: BusStop[]
  publicTransitData: PublicTransitResponse | null
  showPublicTransit: boolean
  populationMeshData: PopulationGeoJSON | null
  showPopulationMesh: boolean
  availableDepartureTimes: string[]

  // ローディング
  isLoading: boolean
  loadingMessage: string

  // イベントハンドラー
  onUpdateCondition: (updates: Partial<ConditionState>) => void
  onNavigateToSimple: () => void
  onNavigateToManual: () => void
  onBackToCondition: () => void
  onBackToBus: () => void
  onExecuteSearch: () => void
  onToggleManualBusStop: (stopId: string) => void
  onUpdateManualBusStops: (stopIds: string[]) => void
  onSelectRoute: (index: number) => void
  onTogglePublicTransit: () => void
  onTogglePopulationMesh: () => void
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
  allRoutes,
  busStopsData,
  publicTransitData,
  showPublicTransit,
  populationMeshData,
  showPopulationMesh,
  availableDepartureTimes,
  isLoading,
  loadingMessage,
  onUpdateCondition,
  onNavigateToSimple,
  onNavigateToManual,
  onBackToCondition,
  onBackToBus,
  onExecuteSearch,
  onToggleManualBusStop,
  onUpdateManualBusStops,
  onSelectRoute,
  onTogglePublicTransit,
  onTogglePopulationMesh,
}: UnifiedMapViewProps) {
  // 結果画面のローカルステート
  const [selectedRouteIndex, setSelectedRouteIndex] = useState<number | null>(null)

  // 画面遷移時のクリーンアップ
  useEffect(() => {
    if (currentScreen !== 'result') {
      setSelectedRouteIndex(null)
    }
  }, [currentScreen])

  // StopSequenceをBusStop[]に変換するヘルパー関数
  const convertStopSequenceToBusStops = (
    stopSequence: StopSequence,
    busStopsData: BusStop[]
  ): BusStop[] => {
    return stopSequence['stop-sequence']
      .map((stopId) => busStopsData.find((bs) => bs.id === stopId))
      .filter((stop): stop is BusStop => stop !== undefined)
  }

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
        {/* === 人口メッシュレイヤー - 全画面共通（最背面） === */}
        <PopulationMeshLayer data={populationMeshData} isVisible={showPopulationMesh} />

        {/* === 公共交通レイヤー - 全画面共通（最背面） === */}
        <PublicTransitLayer data={publicTransitData} isVisible={showPublicTransit} />

        {/* === 到達圏ポリゴン - condition/bus-simple/bus-manual画面 === */}
        {(currentScreen === 'condition' ||
          currentScreen === 'bus-simple' ||
          currentScreen === 'bus-manual') &&
          reachability && (
            <ReachabilityLayer
              key={`${condition.selectedSpotId}-${condition.maxMinute}-${condition.walkingDistance}-${condition.departureTime}`}
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

        {/* === バス停マーカーとルート - bus-simple画面（複数ルート対応） === */}
        {currentScreen === 'bus-simple' && allRoutes.length > 0 && (
          <>
            {allRoutes.map((route, index) => {
              const routeBusStops = convertStopSequenceToBusStops(route, busStopsData)
              const isSelected = index === busCondition.selectedRouteIndex

              return (
                <div key={`route-${index}`}>
                  {/* 選択されたルートのみマーカーを表示 */}
                  {isSelected &&
                    routeBusStops.map((stop) => (
                      <BusStopMarker
                        key={`${index}-${stop.id}`}
                        stop={stop}
                        isSelected={true}
                        onSelect={() => {}}
                      />
                    ))}

                  {/* 全ルートの経路を表示（選択/非選択で色分け） */}
                  {routeBusStops.length >= 2 && (
                    <BusRoutePolyline
                      stops={routeBusStops}
                      color={isSelected ? '#2563eb' : '#94a3b8'}
                      isSelected={isSelected}
                      onSelectRoute={() => onSelectRoute(index)}
                    />
                  )}
                </div>
              )
            })}
          </>
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
                isManualMode={true}
              />
            )
          })}

        {/* === バス経路 - bus-manual画面 === */}
        {currentScreen === 'bus-manual' && manualBusStops.length >= 2 && (
          <BusRoutePolyline stops={manualBusStops} />
        )}

        {/* === バス停マーカー - result画面 === */}
        {currentScreen === 'result' &&
          busStopsFromResult
            .filter((stop) => {
              // サンプル経路が選択されていない場合は全バス停を表示
              if (selectedRouteIndex === null) return true

              // サンプル経路が選択されている場合、導入後経路のsectionsに含まれるバス停のみ表示
              const routePair = facilityResult?.['route-pairs']?.[selectedRouteIndex]
              if (!routePair) return false

              // 導入後経路のsectionsからバス停名を収集
              const stopNames = new Set<string>()
              routePair['with-combus'].sections.forEach((section) => {
                stopNames.add(section.from.name)
                stopNames.add(section.to.name)
              })

              return stopNames.has(stop.name)
            })
            .map((stop) => (
              <BusStopMarker
                key={stop.id}
                stop={stop}
                isSelected={true}
                onSelect={() => {}}
              />
            ))}

        {/* === バス経路 - result画面（サンプル経路非選択時のみ表示） === */}
        {currentScreen === 'result' && selectedRouteIndex === null && busStopsFromResult.length >= 2 && (
          <BusRoutePolyline stops={busStopsFromResult} combusData={combusData} />
        )}

        {/* === サンプル経路 - result画面 === */}
        {currentScreen === 'result' && selectedRouteIndex !== null && facilityResult?.['route-pairs']?.[selectedRouteIndex] && (
          <SampleRoutePolyline
            routePair={facilityResult['route-pairs'][selectedRouteIndex]}
          />
        )}
      </Map>}

      {/* === レイヤーコントロールパネル - 全画面共通 === */}
      <LayerControlPanel
        showPublicTransit={showPublicTransit}
        onTogglePublicTransit={onTogglePublicTransit}
        showPopulationMesh={showPopulationMesh}
        onTogglePopulationMesh={onTogglePopulationMesh}
      />

      {/* === 左パネル - 画面ごとに切り替え === */}
      {currentScreen === 'condition' && (
        <ConditionPanel
          condition={condition}
          spots={allSpots}
          availableDepartureTimes={availableDepartureTimes}
          onUpdate={onUpdateCondition}
          onNext={onNavigateToSimple}
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === 'bus-simple' && (
        <BusConditionPanel
          allRoutes={allRoutes}
          selectedRouteIndex={busCondition.selectedRouteIndex}
          onSelectRoute={onSelectRoute}
          onNext={onExecuteSearch}
          onSwitchToManual={onNavigateToManual}
          onBack={onBackToCondition}
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === 'bus-manual' && (
        <BusManualPanel
          selectedStops={manualBusStops}
          onReorder={onUpdateManualBusStops}
          onDeselect={onToggleManualBusStop}
          onNext={onExecuteSearch}
          onBackToSimple={onNavigateToSimple}
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === 'result' && (
        <BusStopDetailPanel
          combusData={combusData}
          routePairs={facilityResult?.['route-pairs'] ?? []}
          selectedRouteIndex={selectedRouteIndex}
          onShowSampleRoute={(index) => {
            setSelectedRouteIndex(index)
          }}
          onCloseSampleRoute={() => {
            setSelectedRouteIndex(null)
          }}
          onBack={onBackToBus}
          currentScreen={currentScreen}
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
          currentScreen={currentScreen}
        />
      )}

      {currentScreen === 'result' && (
        <ResultSummaryPanel
          condition={condition}
          reachability={reachability}
          facilityResult={facilityResult}
          spots={allSpots}
          currentScreen={currentScreen}
        />
      )}


      {/* === ローディング === */}
      {isLoading && <Loading message={loadingMessage} />}
    </div>
  )
}
