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

export interface RouteSection {
  mode: 'walk' | 'bus' | 'combus' | 'tram'
  'distance-m': number
  'duration-m': number
  from: {
    name: string
    coord: { lat: number; lon: number }
  }
  to: {
    name: string
    coord: { lat: number; lon: number }
  }
  geometry: string
}

export interface RoutePair {
  'duration-m': number
  'distance-m': number
  'walk-distance-m': number
  geometry: string
  from: {
    name: string
    coord: { lat: number; lon: number }
  }
  to: {
    name: string
    coord: { lat: number; lon: number }
  }
  sections: RouteSection[]
}

export interface FacilityReachability {
  reachable: {
    original: MultiPolygon
    'with-combus': MultiPolygon
  }
  spots: FacilitySpot[]
  'route-pairs': RoutePair[]
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
    area: FacilityReachability
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
    area: FacilityReachabilityWithScore
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
  spot: {
    id: string
    lat: number
    lon: number
    name: string
  }
  'time-limit': number // 30-90分
  'walk-distance-limit': number // 500/1000m
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
export interface StopSequence {
  spot: string // 個別スポットID
  'time-limit-m': number // 時間上限（30-90分）
  'walk-distance-limit-m': number // 徒歩距離上限（500/1000m）
  'stop-sequence': string[] // バス停ID配列
  score: number // 到達圏スコア
}

export interface StopSequencesResponse {
  result: {
    'best-combus-stop-sequences': StopSequence[]
  }
  status: string
}

// 対象リージョン取得APIのレスポンス
export interface Coord {
  lat: number
  lon: number
}

export interface TargetRegionResponse {
  result: {
    'north-east': Coord
    'south-west': Coord
  }
  status: string
}

// アプリケーション状態
export interface ConditionState {
  selectedSpotId: string // 個別スポットID
  maxMinute: number // 時間上限（30-90分）
  walkingDistance: number // 1000m固定
}

export interface BusConditionState {
  roundTripTime: number // 周回所要時間（30-90分）
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
  stopSequences: StopSequence[] | null
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
