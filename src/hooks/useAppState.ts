'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  ScreenType,
  AppState,
  ReachabilityItem,
  SpotsResponse,
  StopSequence,
  APIResponseWithScore,
} from '@/types'
import { fetchReachabilityList } from '@/lib/api/reachabilityList'
import { fetchStopSequences } from '@/lib/api/stopSequences'
import { fetchAreaSearch } from '@/lib/api/areaSearch'
import { fetchSpots } from '@/lib/api/spots'
import { fetchBusStops } from '@/lib/api/busStops'
import { fetchTargetRegion, MapCenter } from '@/lib/api/targetRegion'
import { fetchPublicTransit } from '@/lib/api/publicTransit'
import { fetchPopulationData } from '@/lib/api/population'
import { BusStop } from '@/types'

const initialState: AppState = {
  currentScreen: 'condition',
  condition: {
    selectedSpotId: '', // 初期表示時にスポットデータ取得後に設定
    maxMinute: 60,
    walkingDistance: 1000,
    departureTime: '',
  },
  busCondition: {
    selectedRouteIndex: 0,
  },
  manualBusStops: [],
  reachabilityList: null,
  spotsData: null,
  stopSequences: null,
  busStopsData: null,
  searchResult: null,
  publicTransitData: null,
  populationMeshData: null,
  showPublicTransit: true,
  showPopulationMesh: false,
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
        publicTransitResponse,
        populationMeshResponse,
      ] = await Promise.all([
        fetchReachabilityList(),
        fetchSpots(),
        fetchStopSequences(),
        fetchBusStops(),
        fetchTargetRegion(),
        fetchPublicTransit(),
        fetchPopulationData(),
      ])

      // reachabilityListから一意な時刻を抽出してソート
      const uniqueTimes = Array.from(
        new Set(
          reachabilityResponse.result.reachables.map(
            (item) => item['start-time']
          )
        )
      ).sort()

      // 初期スポットに対応するバス停を検索
      const initialSpotId = spotsResponse.spots[0]?.id || ''
      const nearStop = busStopsResponse.find(
        (stop) => stop.nearSpotId === initialSpotId
      )

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
        stopSequences: stopSequencesResponse.result['best-combus-stop-sequences'],
        busStopsData: busStopsResponse,
        publicTransitData: publicTransitResponse,
        populationMeshData: populationMeshResponse,
        condition: {
          ...prev.condition,
          selectedSpotId: initialSpotId,
          departureTime: uniqueTimes[0] || '',
        },
        manualBusStops: nearStop ? [nearStop.id] : [],
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
    setState((prev) => {
      // 到達圏の条件設定からコミュニティバス条件設定に遷移する場合、レイヤー表示をリセット
      const shouldResetLayers =
        prev.currentScreen === 'condition' &&
        (screen === 'bus-simple' || screen === 'bus-manual')

      return {
        ...prev,
        currentScreen: screen,
        showPublicTransit: shouldResetLayers ? false : prev.showPublicTransit,
        showPopulationMesh: shouldResetLayers ? false : prev.showPopulationMesh,
      }
    })
  }, [])

  // 到達圏の条件を更新
  const updateCondition = useCallback(
    (updates: Partial<AppState['condition']>) => {
      setState((prev) => {
        // スポットが変更された場合、手動選択バス停を初期化
        let newManualBusStops = prev.manualBusStops
        if (updates.selectedSpotId && updates.selectedSpotId !== prev.condition.selectedSpotId) {
          const nearStop = prev.busStopsData?.find(
            (stop) => stop.nearSpotId === updates.selectedSpotId
          )
          if (nearStop) {
            newManualBusStops = [nearStop.id]
          } else {
            newManualBusStops = []
          }
        }

        return {
          ...prev,
          condition: {
            ...prev.condition,
            ...updates,
          },
          busCondition: {
            ...prev.busCondition,
            selectedRouteIndex: 0, // 条件変更時はルートをリセット
          },
          manualBusStops: newManualBusStops,
        }
      })
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
    const { condition, stopSequences, currentScreen, manualBusStops } = state

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

      // 現在選択されているルートを取得
      const selectedRoute = getSelectedRoute()

      if (!selectedRoute) {
        console.error('No matching stop sequence found', {
          spotId: condition.selectedSpotId,
          timeLimit: condition.maxMinute,
          walkDistanceLimit: condition.walkingDistance,
        })
        return
      }

      combusStops = selectedRoute['stop-sequence']
    }

    setState((prev) => ({
      ...prev,
      isLoading: true,
      loadingMessage: '到達圏を検索中...',
    }))

    try {
      const result = await fetchAreaSearch({
        'target-spot': condition.selectedSpotId,
        'max-minute': condition.maxMinute,
        'max-walk-distance': condition.walkingDistance,
        'combus-stops': combusStops,
        'start-time': condition.departureTime,
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
          item.spot.id === condition.selectedSpotId &&
          item['time-limit'] === condition.maxMinute &&
          item['walk-distance-limit'] === condition.walkingDistance &&
          item['start-time'] === condition.departureTime
      ) || null
    )
  }, [state])

  // 現在の条件に合致するスポット一覧を取得
  const getCurrentSpots = useCallback(() => {
    const { spotsData, condition } = state
    if (!spotsData) return []

    // 選択された個別スポットのみを返す
    const selectedSpot = spotsData.result.spots.find(
      (spot) => spot.id === condition.selectedSpotId
    )
    return selectedSpot ? [selectedSpot] : []
  }, [state])

  // 利用可能なスポット一覧を取得
  const getSpots = useCallback(() => {
    const { spotsData } = state
    if (!spotsData) return []
    return spotsData.result.spots
  }, [state])

  // 現在の条件に合致する全ルート候補を取得
  const getAllMatchingRoutes = useCallback((): StopSequence[] => {
    const { stopSequences, condition } = state
    if (!stopSequences) return []

    // 条件に合致するすべてのルートをフィルタ（スコア順にソート済みと想定）
    return stopSequences.filter(
      (seq) =>
        seq.spot === condition.selectedSpotId &&
        seq['time-limit-m'] === condition.maxMinute &&
        seq['walk-distance-limit-m'] === condition.walkingDistance &&
        seq['start-time'] === condition.departureTime
    )
  }, [state])

  // 現在選択されているルートを取得
  const getSelectedRoute = useCallback((): StopSequence | null => {
    const { busCondition } = state
    const allRoutes = getAllMatchingRoutes()
    if (allRoutes.length === 0) return null
    return allRoutes[busCondition.selectedRouteIndex] || null
  }, [state, getAllMatchingRoutes])

  // 選択された条件に合致するバス停一覧を取得
  const getSelectedBusStops = useCallback((): BusStop[] => {
    const { busStopsData } = state
    if (!busStopsData) return []

    // 選択されたルートを取得
    const selectedRoute = getSelectedRoute()
    if (!selectedRoute) {
      return []
    }

    // バス停IDからBusStopオブジェクトを取得
    return selectedRoute['stop-sequence']
      .map((stopId) => busStopsData.find((stop) => stop.id === stopId))
      .filter((stop): stop is BusStop => stop !== undefined)
  }, [state, getSelectedRoute])

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

  // 利用可能な出発時刻一覧を取得
  const getAvailableDepartureTimes = useCallback((): string[] => {
    const { reachabilityList, condition } = state
    if (!reachabilityList) return []

    // reachabilityListから現在の条件（スポット、時間上限、徒歩距離）に合致する時刻を抽出
    const uniqueTimes = Array.from(
      new Set(
        reachabilityList
          .filter(
            (item) =>
              item.spot.id === condition.selectedSpotId &&
              item['time-limit'] === condition.maxMinute &&
              item['walk-distance-limit'] === condition.walkingDistance
          )
          .map((item) => item['start-time'])
      )
    ).sort()

    return uniqueTimes
  }, [state])

  // 公共交通レイヤーの表示/非表示をトグル
  const togglePublicTransit = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showPublicTransit: !prev.showPublicTransit,
    }))
  }, [])

  // 人口メッシュレイヤーの表示/非表示をトグル
  const togglePopulationMesh = useCallback(() => {
    setState((prev) => ({
      ...prev,
      showPopulationMesh: !prev.showPopulationMesh,
    }))
  }, [])

  return {
    state,
    mapCenter,
    navigateTo,
    updateCondition,
    updateBusCondition,
    executeSearch,
    getCurrentReachability,
    getCurrentSpots,
    getSpots,
    getAllMatchingRoutes,
    getSelectedRoute,
    getSelectedBusStops,
    loadInitialData,
    toggleManualBusStop,
    updateManualBusStops,
    getManualBusStops,
    getAvailableDepartureTimes,
    togglePublicTransit,
    togglePopulationMesh,
  }
}
