import { useState, useCallback } from 'react'
import { BusStop, ReachabilityGeoJSON, PopulationGeoJSON } from '@/types'

export function useMapState() {
  // --- レイヤー表示状態 ---
  const [showReachability1, setShowReachability1] = useState(true)
  const [showReachability2, setShowReachability2] = useState(false)
  const [showPopulation, setShowPopulation] = useState(false)

  // --- 停留所選択状態 ---
  const [selectedStops, setSelectedStops] = useState<BusStop[]>([])
  const [reachability2Data, setReachability2Data] = useState<ReachabilityGeoJSON | null>(null)
  const [populationData] = useState<PopulationGeoJSON | null>(null)

  // --- 停留所選択/解除のハンドラー ---
  const handleSelectStop = useCallback((stop: BusStop) => {
    const isSelected = selectedStops.some((s) => s.id === stop.id)

    if (isSelected) {
      // 選択解除
      setSelectedStops(selectedStops.filter((s) => s.id !== stop.id))
    } else {
      // 選択追加
      setSelectedStops([...selectedStops, stop])
    }
  }, [selectedStops])

  // --- 進むボタンのハンドラー ---
  const handleProceed = useCallback(async () => {
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
  }, [selectedStops])

  // --- 戻るボタンのハンドラー ---
  const handleReset = useCallback(() => {
    setSelectedStops([])
    setReachability2Data(null)
    setShowReachability2(false)
  }, [])

  // --- レイヤー表示切り替えハンドラー ---
  const toggleReachability1 = useCallback(() => {
    setShowReachability1(!showReachability1)
  }, [showReachability1])

  const toggleReachability2 = useCallback(() => {
    setShowReachability2(!showReachability2)
  }, [showReachability2])

  const togglePopulation = useCallback(() => {
    setShowPopulation(!showPopulation)
  }, [showPopulation])

  return {
    // レイヤー関連
    layers: {
      showReachability1,
      showReachability2,
      showPopulation,
      toggleReachability1,
      toggleReachability2,
      togglePopulation,
    },
    // 停留所関連
    stops: {
      selected: selectedStops,
      canProceed: selectedStops.length >= 2,
      onSelect: handleSelectStop,
      onProceed: handleProceed,
      onReset: handleReset,
    },
    // データ
    data: {
      reachability2: reachability2Data,
      population: populationData,
    },
  }
}
