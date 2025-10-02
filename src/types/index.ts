import { FeatureCollection, Geometry } from 'geojson'

export interface BusStop {
  id: string
  name: string
  lat: number
  lng: number
}

export interface ReachabilityGeoJSON extends FeatureCollection {
  features: Array<{
    type: 'Feature'
    geometry: Geometry
    properties: {
      [key: string]: any
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
      [key: string]: any
    }
  }>
}

export interface BusRouteResponse {
  route: ReachabilityGeoJSON
  reachability2: ReachabilityGeoJSON
}
