import { FeatureCollection, Geometry } from 'geojson'

export interface BusStop {
  id: string
  name: string
  lat: number
  lng: number
}

export interface Spot {
  id: string
  name: string
  lat: number
  lng: number
  type: string
}

// 到達圏データはMultiPolygonジオメトリとして扱う
export type ReachabilityGeoJSON = {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}

export interface PopulationGeoJSON extends FeatureCollection {
  features: Array<{
    type: 'Feature'
    geometry: Geometry
    properties: {
      meshCode: string
      population?: number
      color?: string
      fillOpacity?: number
      [key: string]: unknown
    }
  }>
}

export interface BusRouteResponse {
  route: ReachabilityGeoJSON
  reachability2: ReachabilityGeoJSON
}

// API関連の型定義
// 動的なスポットタイプに対応するためstring型に変更
export type FacilityType = string

export interface APIRequest {
  'target-spots': FacilityType[]
  'max-minute': number
  'combus-stops': string[]
}

export interface MultiPolygon {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}

export interface FacilitySpot {
  coord: {
    lat: number
    lon: number
  }
  name: string
  'spot-type': FacilityType
}

export interface FacilityReachability {
  reachable: {
    original: MultiPolygon
    'with-combus': MultiPolygon
  }
  spots: FacilitySpot[]
}

export interface BusSection {
  'distance-km': number
  'duration-m': number
  geometry: string // Polyline encoded string
}

export interface BusStopCoord {
  coord: {
    lat: number
    lon: number
  }
  id: string
  name: string
}

export interface CombusData {
  'section-list': BusSection[]
  'stop-list': BusStopCoord[]
}

export interface APIResponse {
  result: {
    area: {
      [key in FacilityType]?: FacilityReachability
    }
    combus: CombusData
  }
  status: string
}

// 拡張されたFacilityReachability（with-combus-score含む）
export interface FacilityReachabilityWithScore extends FacilityReachability {
  reachable: {
    original: MultiPolygon
    'with-combus': MultiPolygon
    'original-score': number
    'original-score-rate': number
    'with-combus-score': number
    'with-combus-score-rate': number
  }
}

export interface APIResponseWithScore {
  result: {
    area: {
      [key in FacilityType]?: FacilityReachabilityWithScore
    }
    combus: CombusData
  }
  status: string
}

// 画面状態の型定義
export type ScreenType = 'condition' | 'bus-simple' | 'bus-manual' | 'result'

// 到達圏探索一覧取得APIのレスポンス
export interface ReachabilityItem {
  polygon: MultiPolygon
  score: number
  'spot-type': string
  'time-limit': number
}

export interface ReachabilityListResponse {
  result: {
    reachables: ReachabilityItem[]
  }
  status: string
}

// スポット一覧取得APIのレスポンス
export interface SpotsResponse {
  result: {
    spots: Spot[]
    types: string[]
  }
  status: string
}

// バス停列一覧取得APIのレスポンス
export interface StopSequenceItem {
  'spot-type': string
  'stop-sequence': string[]
  'time-limit': number
}

export interface StopSequencesResponse {
  result: StopSequenceItem[]
  status: string
}

// アプリケーション状態
export interface ConditionState {
  selectedSpotType: string
  maxMinute: number
  walkingDistance: number // 1000m固定
}

export interface BusConditionState {
  roundTripTime: number // 周回所要時間（60-120分）
}

export interface AppState {
  // 現在の画面
  currentScreen: ScreenType

  // 到達圏の条件設定
  condition: ConditionState

  // コミュニティバス経路生成条件
  busCondition: BusConditionState

  // 手動選択バス停（bus-manual画面用）
  manualBusStops: string[]

  // API データ
  reachabilityList: ReachabilityItem[] | null
  spotsData: SpotsResponse | null
  stopSequences: StopSequenceItem[] | null
  busStopsData: BusStop[] | null
  searchResult: APIResponseWithScore | null

  // ローディング状態
  isLoading: boolean
  loadingMessage: string
}

// パネル状態
export interface PanelState {
  isOpen: boolean
  position: 'left' | 'right'
}
