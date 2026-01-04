import { TargetRegionResponse, Coord } from '@/types'

const API_URL = 'https://prometheus-h24i.onrender.com/target/region'

export interface MapCenter {
  lat: number
  lng: number
}

export async function fetchTargetRegion(): Promise<MapCenter> {
  try {
    const response = await fetch(API_URL, {
      cache: 'force-cache', // ビルド時にキャッシュ
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch target region: ${response.status}`)
    }

    const data: TargetRegionResponse = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`API returned error status: ${data.status}`)
    }

    // 北東と南西の座標から中心座標を計算
    const northEast = data.result['north-east']
    const southWest = data.result['south-west']

    const centerLat = (northEast.lat + southWest.lat) / 2
    const centerLng = (northEast.lon + southWest.lon) / 2

    return {
      lat: centerLat,
      lng: centerLng,
    }
  } catch (error) {
    console.error('Error fetching target region:', error)
    // フォールバック: 富山市中心部（デフォルト値）
    return {
      lat: 36.6959,
      lng: 137.2137,
    }
  }
}
