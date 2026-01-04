'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ScreenType,
  AppState,
  ReachabilityItem,
  SpotsResponse,
  StopSequenceItem,
  APIResponseWithScore,
} from '@/types'
import { fetchReachabilityList } from '@/lib/api/reachabilityList'
import { fetchStopSequences } from '@/lib/api/stopSequences'
import { fetchAreaSearch } from '@/lib/api/areaSearch'
import { fetchSpots } from '@/lib/api/spots'
import { fetchBusStops } from '@/lib/api/busStops'
import { fetchTargetRegion, MapCenter } from '@/lib/api/targetRegion'
import { BusStop } from '@/types'

const initialState: AppState = {
  currentScreen: 'condition',
  condition: {
    selectedSpotType: 'hospital',
    maxMinute: 60,
    walkingDistance: 1000,
  },
  busCondition: {
    roundTripTime: 60,
  },
  manualBusStops: [],
  reachabilityList: null,
  spotsData: null,
  stopSequences: null,
  busStopsData: null,
  searchResult: null,
  isLoading: false,
  loadingMessage: '',
}

export function useAppState() {
  const [state, setState] = useState<AppState>(initialState)
  const [mapCenter, setMapCenter] = useState<MapCenter | null>(null)

  // 初期データの取得（到達圏探索一覧、スポット一覧、バス停列一覧、対象リージョン）
  const loadInitialData = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingMessage: '初期データを読み込み中...',
    }))

    try {
      const [
        reachabilityResponse,
        spotsResponse,
        stopSequencesResponse,
        busStopsResponse,
        targetRegionResponse,
      ] = await Promise.all([
        fetchReachabilityList(),
        fetchSpots(),
        fetchStopSequences(),
        fetchBusStops(),
        fetchTargetRegion(),
      ])

      console.log('Reachability response:', reachabilityResponse)
      console.log('Spots response:', spotsResponse)
      console.log('Stop sequences response:', stopSequencesResponse)
      console.log('Bus stops response:', busStopsResponse)
      console.log('Target region response:', targetRegionResponse)

      setState((prev) => ({
        ...prev,
        reachabilityList: reachabilityResponse.result.reachables,
        spotsData: {
          result: {
            spots: spotsResponse.spots,
            types: spotsResponse.types,
          },
          status: 'OK',
        },
        stopSequences: stopSequencesResponse.result,
        busStopsData: busStopsResponse,
        isLoading: false,
        loadingMessage: '',
      }))

      // 地図中心座標をセット
      setMapCenter(targetRegionResponse)
    } catch (error) {
      console.error('Failed to load initial data:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        loadingMessage: '',
      }))
    }
  }, [])

  // 初回マウント時にデータを取得
  useEffect(() => {
    loadInitialData()
  }, [loadInitialData])

  // 画面遷移
  const navigateTo = useCallback((screen: ScreenType) => {
    setState((prev) => ({
      ...prev,
      currentScreen: screen,
    }))
  }, [])

  // 到達圏の条件を更新
  const updateCondition = useCallback(
    (updates: Partial<AppState['condition']>) => {
      setState((prev) => ({
        ...prev,
        condition: {
          ...prev.condition,
          ...updates,
        },
      }))
    },
    []
  )

  // バス生成条件を更新
  const updateBusCondition = useCallback(
    (updates: Partial<AppState['busCondition']>) => {
      setState((prev) => ({
        ...prev,
        busCondition: {
          ...prev.busCondition,
          ...updates,
        },
      }))
    },
    []
  )

  // 到達圏検索APIを呼び出し（結果画面に遷移時）
  const executeSearch = useCallback(async () => {
    const { condition, busCondition, stopSequences, currentScreen, manualBusStops } = state

    let combusStops: string[]

    if (currentScreen === 'bus-manual') {
      // 手動選択の場合
      combusStops = manualBusStops
      if (combusStops.length < 2) {
        console.error('At least 2 bus stops must be selected')
        return
      }
    } else {
      // 簡易選択の場合
      if (!stopSequences) {
        console.error('Stop sequences not loaded')
        return
      }

      // 選択された条件に合致するバス停列を取得
      const matchingSequence = stopSequences.find(
        (seq) =>
          seq['spot-type'] === condition.selectedSpotType &&
          seq['time-limit'] === busCondition.roundTripTime
      )

      if (!matchingSequence) {
        console.error('No matching stop sequence found')
        return
      }

      combusStops = matchingSequence['stop-sequence']
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingMessage: '到達圏を検索中...',
    }))

    try {
      const result = await fetchAreaSearch({
        'target-spots': [condition.selectedSpotType],
        'max-minute': condition.maxMinute,
        'combus-stops': combusStops,
      })

      setState((prev) => ({
        ...prev,
        searchResult: result,
        currentScreen: 'result',
        isLoading: false,
        loadingMessage: '',
      }))
    } catch (error) {
      console.error('Failed to execute search:', error)
      setState((prev) => ({
        ...prev,
        isLoading: false,
        loadingMessage: '',
      }))
    }
  }, [state])

  // 現在の条件に合致する到達圏データを取得
  const getCurrentReachability = useCallback((): ReachabilityItem | null => {
    const { reachabilityList, condition } = state
    if (!reachabilityList) return null

    return (
      reachabilityList.find(
        (item) =>
          item['spot-type'] === condition.selectedSpotType &&
          item['time-limit'] === condition.maxMinute
      ) || null
    )
  }, [state])

  // 現在の条件に合致するスポット一覧を取得
  const getCurrentSpots = useCallback(() => {
    const { spotsData, condition } = state
    if (!spotsData) return []

    return spotsData.result.spots.filter(
      (spot) => spot.type === condition.selectedSpotType
    )
  }, [state])

  // 利用可能なスポットタイプ一覧を取得
  const getSpotTypes = useCallback((): string[] => {
    const { spotsData } = state
    if (!spotsData) return []
    return spotsData.result.types
  }, [state])

  // 選択された条件に合致するバス停一覧を取得
  const getSelectedBusStops = useCallback((): BusStop[] => {
    const { stopSequences, busStopsData, condition, busCondition } = state
    if (!stopSequences || !busStopsData) return []

    // 選択された条件に合致するバス停列を取得
    const matchingSequence = stopSequences.find(
      (seq) =>
        seq['spot-type'] === condition.selectedSpotType &&
        seq['time-limit'] === busCondition.roundTripTime
    )

    if (!matchingSequence) return []

    // バス停IDからBusStopオブジェクトを取得
    return matchingSequence['stop-sequence']
      .map((stopId) => busStopsData.find((stop) => stop.id === stopId))
      .filter((stop): stop is BusStop => stop !== undefined)
  }, [state])

  // 手動選択バス停のトグル（地図クリック時）
  const toggleManualBusStop = useCallback((stopId: string) => {
    setState((prev) => {
      const currentStops = prev.manualBusStops
      const index = currentStops.indexOf(stopId)

      if (index >= 0) {
        // 既に選択されている場合は削除
        return {
          ...prev,
          manualBusStops: currentStops.filter((id) => id !== stopId),
        }
      } else {
        // 未選択の場合は末尾に追加
        return {
          ...prev,
          manualBusStops: [...currentStops, stopId],
        }
      }
    })
  }, [])

  // 手動選択バス停の更新（ドラッグ&ドロップ後）
  const updateManualBusStops = useCallback((stopIds: string[]) => {
    setState((prev) => ({
      ...prev,
      manualBusStops: stopIds,
    }))
  }, [])

  // 手動選択バス停の取得（IDからBusStopオブジェクトに変換）
  const getManualBusStops = useCallback((): BusStop[] => {
    const { manualBusStops, busStopsData } = state
    if (!busStopsData) return []

    return manualBusStops
      .map((stopId) => busStopsData.find((stop) => stop.id === stopId))
      .filter((stop): stop is BusStop => stop !== undefined)
  }, [state])

  return {
    state,
    mapCenter,
    navigateTo,
    updateCondition,
    updateBusCondition,
    executeSearch,
    getCurrentReachability,
    getCurrentSpots,
    getSpotTypes,
    getSelectedBusStops,
    loadInitialData,
    toggleManualBusStop,
    updateManualBusStops,
    getManualBusStops,
  }
}
