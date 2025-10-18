import { useState, useCallback, useEffect } from 'react'
import { BusStop, FacilityType, APIRequest, APIResponse, FacilityReachability, PopulationGeoJSON } from '@/types'
import { fetchPopulationData } from '@/lib/api/population'

const API_URL = 'https://prometheus-h24i.onrender.com/area/search'

export function useMapState(availableSpotTypes: string[] = []) {
  // --- 検索条件 ---
  const [selectedFacilities, setSelectedFacilities] = useState<FacilityType[]>([])
  const [maxMinute, setMaxMinute] = useState(60)

  // --- スポット表示状態 ---
  const [selectedSpotTypes, setSelectedSpotTypes] = useState<string[]>([])

  // availableSpotTypesが変わったら両方を初期化（同期）
  useEffect(() => {
    setSelectedFacilities(availableSpotTypes)
    setSelectedSpotTypes(availableSpotTypes)
  }, [availableSpotTypes.join(',')]) // eslint-disable-line react-hooks/exhaustive-deps

  // --- レイヤー表示状態 ---
  const [showReachability1, setShowReachability1] = useState<Record<string, boolean>>({})
  const [showReachability2, setShowReachability2] = useState<Record<string, boolean>>({})
  const [showPopulation, setShowPopulation] = useState(false)

  // --- 停留所選択状態 ---
  const [selectedStops, setSelectedStops] = useState<BusStop[]>([])

  // --- 編集ロック状態 ---
  const [isEditable, setIsEditable] = useState(true)

  // --- ローディング状態 ---
  const [isLoading, setIsLoading] = useState(false)

  // --- データ ---
  const [facilityData, setFacilityData] = useState<Record<string, FacilityReachability | null>>({})
  const [populationData, setPopulationData] = useState<PopulationGeoJSON | null>(null)

  // 人口分布データの読み込み
  useEffect(() => {
    async function loadPopulation() {
      const data = await fetchPopulationData()
      setPopulationData(data)
    }
    loadPopulation()
  }, [])

  // --- 施設タイプ切り替え ---
  const toggleFacility = useCallback((facility: FacilityType) => {
    setSelectedFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    )
  }, [])

  // --- 停留所選択のハンドラー ---
  const handleSelectStop = useCallback((stop: BusStop) => {
    const isSelected = selectedStops.some((s) => s.id === stop.id)

    // 未選択の場合のみ選択を追加
    if (!isSelected) {
      setSelectedStops([...selectedStops, stop])
    }
  }, [selectedStops])

  // --- 停留所解除のハンドラー ---
  const handleDeselectStop = useCallback((stop: BusStop) => {
    setSelectedStops(selectedStops.filter((s) => s.id !== stop.id))
  }, [selectedStops])

  // --- 進むボタンのハンドラー ---
  const handleProceed = useCallback(async () => {
    if (selectedStops.length < 2 || selectedFacilities.length === 0) return

    setIsLoading(true)

    try {
      // リクエストボディの構築
      const requestBody: APIRequest = {
        'target-spots': selectedFacilities,
        'max-minute': maxMinute,
        'combus-stops': selectedStops.map(stop => stop.id),
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data: APIResponse = await response.json()

      if (data.status === 'OK') {
        // レスポンスからデータを設定
        const newFacilityData: Record<string, FacilityReachability | null> = {}

        selectedFacilities.forEach(facility => {
          newFacilityData[facility] = data.result.area[facility] || null
        })

        setFacilityData(newFacilityData)

        // 取得できた施設タイプのレイヤーを自動的に表示
        const newShowReachability1 = { ...showReachability1 }
        const newShowReachability2 = { ...showReachability2 }

        selectedFacilities.forEach(facility => {
          if (data.result.area[facility]) {
            newShowReachability1[facility] = true
            newShowReachability2[facility] = true
          }
        })

        setShowReachability1(newShowReachability1)
        setShowReachability2(newShowReachability2)

        // 編集を無効化
        setIsEditable(false)
      }
    } catch (error) {
      console.error('API Call Error:', error)
      alert('APIの呼び出しに失敗しました')
    } finally {
      setIsLoading(false)
    }
  }, [selectedStops, selectedFacilities, maxMinute, showReachability1, showReachability2])

  // --- 戻るボタンのハンドラー ---
  const handleReset = useCallback(() => {
    // 停留所リストはリセットしない
    setFacilityData({})
    setShowReachability1({})
    setShowReachability2({})
    // 編集を再度可能にする
    setIsEditable(true)
  }, [])

  // --- 停留所順序変更ハンドラー ---
  const handleReorderStops = useCallback((newStops: BusStop[]) => {
    setSelectedStops(newStops)
  }, [])

  // --- レイヤー表示切り替えハンドラー ---
  const toggleReachability1 = useCallback((facility: FacilityType) => {
    setShowReachability1(prev => ({
      ...prev,
      [facility]: !prev[facility],
    }))
  }, [])

  const toggleReachability2 = useCallback((facility: FacilityType) => {
    setShowReachability2(prev => ({
      ...prev,
      [facility]: !prev[facility],
    }))
  }, [])

  const togglePopulation = useCallback(() => {
    setShowPopulation(!showPopulation)
  }, [showPopulation])

  // --- スポットタイプ切り替えハンドラー ---
  const toggleSpotType = useCallback((type: string) => {
    setSelectedSpotTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }, [])

  // 利用可能な施設タイプ（データが取得できているもの）
  const availableFacilities = selectedFacilities.filter(
    facility => facilityData[facility]
  )

  return {
    // 検索条件
    search: {
      selectedFacilities,
      maxMinute,
      toggleFacility,
      setMaxMinute,
    },
    // スポット表示
    spotDisplay: {
      selectedTypes: selectedSpotTypes,
      toggleType: toggleSpotType,
    },
    // レイヤー関連
    layers: {
      showReachability1,
      showReachability2,
      showPopulation,
      availableFacilities,
      toggleReachability1,
      toggleReachability2,
      togglePopulation,
    },
    // 停留所関連
    stops: {
      selected: selectedStops,
      canProceed: selectedStops.length >= 2 && selectedFacilities.length > 0 && isEditable,
      canReset: !isEditable,
      isEditable,
      onSelect: handleSelectStop,
      onDeselect: handleDeselectStop,
      onProceed: handleProceed,
      onReset: handleReset,
      onReorder: handleReorderStops,
    },
    // データ
    data: {
      facilities: facilityData,
      population: populationData,
    },
    // UI状態
    ui: {
      isLoading,
    },
  }
}
