'use client'

import dynamic from 'next/dynamic'
import SearchPanel from '@/components/ui/SearchPanel'
import LayerControlPanel from '@/components/map/LayerControlPanel'
import BusStopSidebar from '@/components/bus/BusStopSidebar'
import Loading from '@/components/ui/Loading'
import { useMapState } from '@/hooks/useMapState'
import { BusStop, Spot, FacilityType } from '@/types'
import { getFacilityColorTheme } from '@/lib/utils/facilityColors'

// Leafletを使用するコンポーネントは動的インポート (SSR無効化)
const Map = dynamic(() => import('@/components/map/Map'), { ssr: false })
const ReachabilityLayer = dynamic(() => import('@/components/layer/ReachabilityLayer'), { ssr: false })
const PopulationLayer = dynamic(() => import('@/components/layer/PopulationLayer'), { ssr: false })
const BusStopMarker = dynamic(() => import('@/components/bus/BusStopMarker'), { ssr: false })
const BusRoutePolyline = dynamic(() => import('@/components/bus/BusRoutePolyline'), { ssr: false })
const SpotMarker = dynamic(() => import('@/components/layer/SpotMarker'), { ssr: false })


interface MapViewProps {
  busStops: BusStop[]
  spots: Spot[]
  spotTypes: string[]
  spotLabels: Record<string, string>
}

export default function MapView({ busStops, spots, spotTypes, spotLabels }: MapViewProps) {
  const { search, layers, stops, data, ui, spotDisplay } = useMapState(spotTypes)

  return (
    <div className="h-screen flex flex-col">
      {/* ローディングオーバーレイ */}
      {ui.isLoading && <Loading />}
      {/* 上部: 検索条件パネル */}
      <SearchPanel
        selectedFacilities={search.selectedFacilities}
        maxMinute={search.maxMinute}
        onToggleFacility={search.toggleFacility}
        onMaxMinuteChange={search.setMaxMinute}
        availableSpotTypes={spotTypes}
        spotLabels={spotLabels}
        selectedSpotTypes={spotDisplay.selectedTypes}
        onToggleSpotType={spotDisplay.toggleType}
      />

      {/* レイヤーコントロールパネル */}
      <LayerControlPanel
        showReachability1={layers.showReachability1}
        showReachability2={layers.showReachability2}
        showPopulation={layers.showPopulation}
        availableFacilities={layers.availableFacilities}
        onToggleReachability1={layers.toggleReachability1}
        onToggleReachability2={layers.toggleReachability2}
        onTogglePopulation={layers.togglePopulation}
        spotLabels={spotLabels}
      />

      {/* 下部: サイドバーと地図 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左サイドバー: 停留所選択 */}
        <BusStopSidebar
          selectedStops={stops.selected}
          onProceed={stops.onProceed}
          onReset={stops.onReset}
          onDeselect={stops.onDeselect}
          canProceed={stops.canProceed}
          canReset={stops.canReset}
          onReorder={stops.onReorder}
          isEditable={stops.isEditable}
        />

        {/* 地図エリア */}
        <div className="flex-1">
          <Map center={[36.67, 137.20]} zoom={12}>
            {/* 到達圏1 (現状) */}
            {(Object.keys(layers.showReachability1) as FacilityType[]).map((facility) => {
              if (!layers.showReachability1[facility] || !data.facilities[facility]) return null

              const facilityData = data.facilities[facility]
              if (!facilityData?.reachable?.original) return null

              const colorTheme = getFacilityColorTheme(facility)
              return (
                <ReachabilityLayer
                  key={`r1-${facility}`}
                  data={facilityData.reachable.original}
                  color={colorTheme.light}
                  fillOpacity={0.3}
                />
              )
            })}

            {/* 到達圏2 (コミュニティバス後) */}
            {(Object.keys(layers.showReachability2) as FacilityType[]).map((facility) => {
              if (!layers.showReachability2[facility] || !data.facilities[facility]) return null

              const facilityData = data.facilities[facility]
              if (!facilityData?.reachable?.['with-combus']) return null

              const colorTheme = getFacilityColorTheme(facility)
              return (
                <ReachabilityLayer
                  key={`r2-${facility}`}
                  data={facilityData.reachable['with-combus']}
                  color={colorTheme.dark}
                  fillOpacity={0.3}
                />
              )
            })}

            {/* 人口分布 */}
            {layers.showPopulation && <PopulationLayer data={data.population} />}

            {/* バスルート */}
            <BusRoutePolyline stops={stops.selected} />

            {/* 停留所マーカー */}
            {busStops
              .filter((stop) => {
                // 編集可能時: すべての停留所を表示
                // 編集不可時: 選択済み停留所のみ表示
                if (stops.isEditable) return true
                return stops.selected.some((s) => s.id === stop.id)
              })
              .map((stop) => {
                const selectedIndex = stops.selected.findIndex((s) => s.id === stop.id)
                const isSelected = selectedIndex !== -1

                return (
                  <BusStopMarker
                    key={stop.id}
                    stop={stop}
                    isSelected={isSelected}
                    selectionOrder={isSelected ? selectedIndex + 1 : undefined}
                    onSelect={stops.isEditable ? stops.onSelect : () => {}}
                    onDeselect={stops.isEditable ? stops.onDeselect : undefined}
                  />
                )
              })}

            {/* スポットマーカー */}
            {spots
              .filter((spot) => spotDisplay.selectedTypes.includes(spot.type))
              .map((spot) => (
                <SpotMarker key={spot.id} spot={spot} />
              ))}
          </Map>
        </div>
      </div>
    </div>
  )
}
