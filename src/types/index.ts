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
