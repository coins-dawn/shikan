import { useState, useCallback } from 'react'
import { BusStop, FacilityType, APIRequest, APIResponse, FacilityReachability } from '@/types'

const API_URL = 'https://prometheus-h24i.onrender.com/search/area'

export function useMapState() {
  // --- 検索条件 ---
  const [selectedFacilities, setSelectedFacilities] = useState<FacilityType[]>(['hospital', 'shopping'])
  const [maxMinute, setMaxMinute] = useState(60)

  // --- レイヤー表示状態 ---
  const [showReachability1, setShowReachability1] = useState<Record<FacilityType, boolean>>({
    hospital: false,
    shopping: false,
  })
  const [showReachability2, setShowReachability2] = useState<Record<FacilityType, boolean>>({
    hospital: false,
    shopping: false,
  })
  const [showPopulation, setShowPopulation] = useState(false)

  // --- 停留所選択状態 ---
  const [selectedStops, setSelectedStops] = useState<BusStop[]>([])

  // --- 編集ロック状態 ---
  const [isEditable, setIsEditable] = useState(true)

  // --- ローディング状態 ---
  const [isLoading, setIsLoading] = useState(false)

  // --- データ ---
  const [facilityData, setFacilityData] = useState<Record<FacilityType, FacilityReachability | null>>({
    hospital: null,
    shopping: null,
  })

  // --- 施設タイプ切り替え ---
  const toggleFacility = useCallback((facility: FacilityType) => {
    setSelectedFacilities(prev =>
      prev.includes(facility)
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    )
  }, [])

  // --- 停留所選択/解除のハンドラー ---
  const handleSelectStop = useCallback((stop: BusStop) => {
    const isSelected = selectedStops.some((s) => s.id === stop.id)

    if (isSelected) {
      setSelectedStops(selectedStops.filter((s) => s.id !== stop.id))
    } else {
      setSelectedStops([...selectedStops, stop])
    }
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
        combus: {
          stops: selectedStops.map(stop => ({
            lat: stop.lat,
            lon: stop.lng,
          })),
          // 循環バス: 終点→始点も含めてstopsと同じ数
          sections: Array(selectedStops.length).fill({ duration: 5 }),
        },
      }

      console.log('API Request:', requestBody)

      // TODO: バックエンド開発完了後、requestBodyを使用
      const fixedRequestBody = {
        'target-spots': ['hospital', 'shopping'],
        'max-minute': 60,
        combus: {
          stops: [
            { lat: 36.65742, lon: 137.17421 },
            { lat: 36.68936, lon: 137.18519 },
            { lat: 36.67738, lon: 137.23892 },
            { lat: 36.65493, lon: 137.24001 },
            { lat: 36.63964, lon: 137.21958 },
          ],
          sections: [
            { duration: 6 },
            { duration: 9 },
            { duration: 5 },
            { duration: 7 },
            { duration: 12 },
          ],
        },
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(fixedRequestBody), // 一時的に固定リクエスト
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data: APIResponse = await response.json()
      console.log('API Response:', data)

      if (data.status === 'OK') {
        // レスポンスからデータを設定
        const newFacilityData: Record<FacilityType, FacilityReachability | null> = {
          hospital: data.result.hospital || null,
          shopping: data.result.shopping || null,
        }
        setFacilityData(newFacilityData)

        // 取得できた施設タイプのレイヤーを自動的に表示
        const newShowReachability1 = { ...showReachability1 }
        const newShowReachability2 = { ...showReachability2 }

        selectedFacilities.forEach(facility => {
          if (data.result[facility]) {
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
    setFacilityData({
      hospital: null,
      shopping: null,
    })
    setShowReachability1({
      hospital: false,
      shopping: false,
    })
    setShowReachability2({
      hospital: false,
      shopping: false,
    })
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

  // 利用可能な施設タイプ（データが取得できているもの）
  const availableFacilities = selectedFacilities.filter(
    facility => facilityData[facility] !== null
  )

  return {
    // 検索条件
    search: {
      selectedFacilities,
      maxMinute,
      toggleFacility,
      setMaxMinute,
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
      canProceed: selectedStops.length >= 2 && selectedFacilities.length > 0,
      isEditable,
      onSelect: handleSelectStop,
      onProceed: handleProceed,
      onReset: handleReset,
      onReorder: handleReorderStops,
    },
    // データ
    data: {
      facilities: facilityData,
    },
    // UI状態
    ui: {
      isLoading,
    },
  }
}
