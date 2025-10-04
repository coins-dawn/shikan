'use client'

import dynamic from 'next/dynamic'
import LayerControlPanel from '@/components/LayerControlPanel'
import BusStopSidebar from '@/components/BusStopSidebar'
import { useMapState } from '@/hooks/useMapState'
import { BusStop } from '@/types'

// Leafletを使用するコンポーネントは動的インポート (SSR無効化)
const Map = dynamic(() => import('@/components/Map'), { ssr: false })
const ReachabilityLayer = dynamic(() => import('@/components/ReachabilityLayer'), { ssr: false })
const PopulationLayer = dynamic(() => import('@/components/PopulationLayer'), { ssr: false })
const BusStopMarker = dynamic(() => import('@/components/BusStopMarker'), { ssr: false })

// ダミーデータ: 停留所候補
const dummyBusStops: BusStop[] = [
  { id: '1', name: '停留所A', lat: 35.6812, lng: 139.7671 },
  { id: '2', name: '停留所B', lat: 35.6822, lng: 139.7681 },
  { id: '3', name: '停留所C', lat: 35.6832, lng: 139.7691 },
  { id: '4', name: '停留所D', lat: 35.6842, lng: 139.7701 },
]

// ダミーデータ: 到達圏1 (現状)
const dummyReachability1 = {
  type: 'FeatureCollection' as const,
  features: [
    {
      type: 'Feature' as const,
      geometry: {
        type: 'Polygon' as const,
        coordinates: [
          [
            [139.765, 35.679],
            [139.770, 35.679],
            [139.770, 35.683],
            [139.765, 35.683],
            [139.765, 35.679],
          ],
        ],
      },
      properties: { name: '現状の到達圏' },
    },
  ],
}

export default function Home() {
  const { layers, stops, data } = useMapState()

  return (
    <div className="h-screen flex flex-col">
      {/* 上部: レイヤーコントロールパネル */}
      <LayerControlPanel
        showReachability1={layers.showReachability1}
        showReachability2={layers.showReachability2}
        showPopulation={layers.showPopulation}
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
        />

        {/* 地図エリア */}
        <div className="flex-1">
          <Map center={[35.6812, 139.7671]} zoom={14}>
            {/* 到達圏1 (現状) */}
            {layers.showReachability1 && (
              <ReachabilityLayer data={dummyReachability1} color="#3b82f6" fillOpacity={0.3} />
            )}

            {/* 到達圏2 (コミュニティバス後) */}
            {layers.showReachability2 && data.reachability2 && (
              <ReachabilityLayer data={data.reachability2} color="#22c55e" fillOpacity={0.3} />
            )}

            {/* 人口分布 */}
            {layers.showPopulation && data.population && <PopulationLayer data={data.population} />}

            {/* 停留所マーカー */}
            {dummyBusStops.map((stop) => {
              const selectedIndex = stops.selected.findIndex((s) => s.id === stop.id)
              const isSelected = selectedIndex !== -1

              return (
                <BusStopMarker
                  key={stop.id}
                  stop={stop}
                  isSelected={isSelected}
                  selectionOrder={isSelected ? selectedIndex + 1 : undefined}
                  onSelect={stops.onSelect}
                />
              )
            })}
          </Map>
        </div>
      </div>
    </div>
  )
}
