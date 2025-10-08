'use client'

import dynamic from 'next/dynamic'
import SearchPanel from '@/components/SearchPanel'
import LayerControlPanel from '@/components/LayerControlPanel'
import BusStopSidebar from '@/components/BusStopSidebar'
import Loading from '@/components/Loading'
import { useMapState } from '@/hooks/useMapState'
import { BusStop, FacilityType } from '@/types'

// Leafletを使用するコンポーネントは動的インポート (SSR無効化)
const Map = dynamic(() => import('@/components/Map'), { ssr: false })
const ReachabilityLayer = dynamic(() => import('@/components/ReachabilityLayer'), { ssr: false })
const PopulationLayer = dynamic(() => import('@/components/PopulationLayer'), { ssr: false })
const BusStopMarker = dynamic(() => import('@/components/BusStopMarker'), { ssr: false })
const BusRoutePolyline = dynamic(() => import('@/components/BusRoutePolyline'), { ssr: false })

// MultiPolygonをGeoJSON FeatureCollectionに変換
function multiPolygonToGeoJSON(multiPolygon: {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}) {
  return {
    type: 'FeatureCollection' as const,
    features: [
      {
        type: 'Feature' as const,
        geometry: {
          type: 'MultiPolygon' as const,
          coordinates: multiPolygon.coordinates,
        },
        properties: {},
      },
    ],
  }
}

interface MapViewProps {
  busStops: BusStop[]
}

export default function MapView({ busStops }: MapViewProps) {
  const { search, layers, stops, data, ui } = useMapState()

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
      />

      {/* 下部: サイドバーと地図 */}
      <div className="flex-1 flex">
        {/* 左サイドバー: 停留所選択 */}
        <BusStopSidebar
          selectedStops={stops.selected}
          onProceed={stops.onProceed}
          onReset={stops.onReset}
          canProceed={stops.canProceed}
          onReorder={stops.onReorder}
          isEditable={stops.isEditable}
        />

        {/* 地図エリア */}
        <div className="flex-1">
          <Map center={[36.67, 137.20]} zoom={12}>
            {/* 到達圏1 (現状) */}
            {(Object.keys(layers.showReachability1) as FacilityType[]).map((facility) => {
              if (!layers.showReachability1[facility] || !data.facilities[facility]) return null

              const geoJSON = multiPolygonToGeoJSON(data.facilities[facility]!.reachable.original)
              return (
                <ReachabilityLayer
                  key={`r1-${facility}`}
                  data={geoJSON}
                  color="#3b82f6"
                  fillOpacity={0.3}
                />
              )
            })}

            {/* 到達圏2 (コミュニティバス後) */}
            {(Object.keys(layers.showReachability2) as FacilityType[]).map((facility) => {
              if (!layers.showReachability2[facility] || !data.facilities[facility]) return null

              const geoJSON = multiPolygonToGeoJSON(data.facilities[facility]!.reachable['with-combus'])
              return (
                <ReachabilityLayer
                  key={`r2-${facility}`}
                  data={geoJSON}
                  color="#22c55e"
                  fillOpacity={0.3}
                />
              )
            })}

            {/* 人口分布 */}
            {layers.showPopulation && <PopulationLayer data={null} />}

            {/* バスルート */}
            <BusRoutePolyline stops={stops.selected} />

            {/* 停留所マーカー */}
            {busStops.map((stop) => {
              const selectedIndex = stops.selected.findIndex((s) => s.id === stop.id)
              const isSelected = selectedIndex !== -1

              return (
                <BusStopMarker
                  key={stop.id}
                  stop={stop}
                  isSelected={isSelected}
                  selectionOrder={isSelected ? selectedIndex + 1 : undefined}
                  onSelect={stops.isEditable ? stops.onSelect : () => {}}
                />
              )
            })}
          </Map>
        </div>
      </div>
    </div>
  )
}
