'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import LayerControlPanel from '@/components/LayerControlPanel'
import BusStopSidebar from '@/components/BusStopSidebar'
import ReachabilityLayer from '@/components/ReachabilityLayer'
import PopulationLayer from '@/components/PopulationLayer'
import BusStopMarker from '@/components/BusStopMarker'
import { BusStop, ReachabilityGeoJSON, PopulationGeoJSON } from '@/types'

// Map コンポーネントは動的インポート (SSR無効化)
const Map = dynamic(() => import('@/components/Map'), { ssr: false })

// ダミーデータ: 停留所候補
const dummyBusStops: BusStop[] = [
  { id: '1', name: '停留所A', lat: 35.6812, lng: 139.7671 },
  { id: '2', name: '停留所B', lat: 35.6822, lng: 139.7681 },
  { id: '3', name: '停留所C', lat: 35.6832, lng: 139.7691 },
  { id: '4', name: '停留所D', lat: 35.6842, lng: 139.7701 },
]

// ダミーデータ: 到達圏1 (現状)
const dummyReachability1: ReachabilityGeoJSON = {
  type: 'FeatureCollection',
  features: [
    {
      type: 'Feature',
      geometry: {
        type: 'Polygon',
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
  // レイヤー表示/非表示の状態
  const [showReachability1, setShowReachability1] = useState(true)
  const [showReachability2, setShowReachability2] = useState(false)
  const [showPopulation, setShowPopulation] = useState(false)

  // 停留所選択の状態
  const [selectedStops, setSelectedStops] = useState<BusStop[]>([])

  // 到達圏2とバス経路のデータ (API取得後に格納)
  const [reachability2Data, setReachability2Data] = useState<ReachabilityGeoJSON | null>(null)

  // 人口分布データ (バックエンドから取得予定)
  const [populationData] = useState<PopulationGeoJSON | null>(null)

  // 停留所選択/解除のハンドラー
  const handleSelectStop = (stop: BusStop) => {
    const isSelected = selectedStops.some((s) => s.id === stop.id)

    if (isSelected) {
      // 選択解除
      setSelectedStops(selectedStops.filter((s) => s.id !== stop.id))
    } else {
      // 選択追加
      setSelectedStops([...selectedStops, stop])
    }
  }

  // 進むボタンのハンドラー
  const handleProceed = async () => {
    if (selectedStops.length < 2) return

    // TODO: バックエンドAPIを呼び出して到達圏2を取得
    console.log('選択された停留所:', selectedStops)

    // ダミーデータで到達圏2を設定
    const dummyReachability2: ReachabilityGeoJSON = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'Polygon',
            coordinates: [
              [
                [139.763, 35.677],
                [139.773, 35.677],
                [139.773, 35.687],
                [139.763, 35.687],
                [139.763, 35.677],
              ],
            ],
          },
          properties: { name: 'コミュニティバス後の到達圏' },
        },
      ],
    }

    setReachability2Data(dummyReachability2)
    setShowReachability2(true)
  }

  // 戻るボタンのハンドラー
  const handleReset = () => {
    setSelectedStops([])
    setReachability2Data(null)
    setShowReachability2(false)
  }

  return (
    <div className="h-screen flex flex-col">
      {/* 上部: レイヤーコントロールパネル */}
      <LayerControlPanel
        showReachability1={showReachability1}
        showReachability2={showReachability2}
        showPopulation={showPopulation}
        onToggleReachability1={() => setShowReachability1(!showReachability1)}
        onToggleReachability2={() => setShowReachability2(!showReachability2)}
        onTogglePopulation={() => setShowPopulation(!showPopulation)}
      />

      {/* 下部: サイドバーと地図 */}
      <div className="flex-1 flex">
        {/* 左サイドバー: 停留所選択 */}
        <BusStopSidebar
          selectedStops={selectedStops}
          onProceed={handleProceed}
          onReset={handleReset}
          canProceed={selectedStops.length >= 2}
        />

        {/* 地図エリア */}
        <div className="flex-1">
          <Map center={[35.6812, 139.7671]} zoom={14}>
            {/* 到達圏1 (現状) */}
            {showReachability1 && (
              <ReachabilityLayer data={dummyReachability1} color="#3b82f6" fillOpacity={0.3} />
            )}

            {/* 到達圏2 (コミュニティバス後) */}
            {showReachability2 && reachability2Data && (
              <ReachabilityLayer data={reachability2Data} color="#22c55e" fillOpacity={0.3} />
            )}

            {/* 人口分布 */}
            {showPopulation && populationData && <PopulationLayer data={populationData} />}

            {/* 停留所マーカー */}
            {dummyBusStops.map((stop) => {
              const selectedIndex = selectedStops.findIndex((s) => s.id === stop.id)
              const isSelected = selectedIndex !== -1

              return (
                <BusStopMarker
                  key={stop.id}
                  stop={stop}
                  isSelected={isSelected}
                  selectionOrder={isSelected ? selectedIndex + 1 : undefined}
                  onSelect={handleSelectStop}
                />
              )
            })}
          </Map>
        </div>
      </div>
    </div>
  )
}
