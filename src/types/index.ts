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

export interface ReachabilityGeoJSON extends FeatureCollection {
  features: Array<{
    type: 'Feature'
    geometry: Geometry
    properties: {
      [key: string]: unknown
    }
  }>
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
  combus: {
    stops: Array<{
      lat: number
      lon: number
    }>
    sections: Array<{
      duration: number
    }>
  }
}

export interface MultiPolygon {
  type: 'MultiPolygon'
  coordinates: number[][][][]
}

export interface FacilitySpot {
  lat: number
  lon: number
  name: string
  type: FacilityType
}

export interface FacilityReachability {
  reachable: {
    original: MultiPolygon
    'with-combus': MultiPolygon
  }
  spots: FacilitySpot[]
}

export interface APIResponse {
  result: {
    [key in FacilityType]?: FacilityReachability
  }
  status: string
}
