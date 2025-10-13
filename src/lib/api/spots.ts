export interface Spot {
  id: string
  name: string
  lat: number
  lng: number
  type: string
}

interface SpotsAPIResponse {
  result: {
    spots: Array<{
      id: string
      lat: number
      lon: number
      name: string
      type: string
    }>
    types: string[]
  }
  status: string
}

const API_URL = 'https://prometheus-h24i.onrender.com/area/spots'

export async function fetchSpots(): Promise<{ spots: Spot[]; types: string[] }> {
  try {
    const response = await fetch(API_URL, {
      cache: 'force-cache', // ビルド時にキャッシュ
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch spots: ${response.status}`)
    }

    const data: SpotsAPIResponse = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`API returned error status: ${data.status}`)
    }

    // APIのlon -> lng に変換
    const spots = data.result.spots.map((spot) => ({
      id: spot.id,
      name: spot.name,
      lat: spot.lat,
      lng: spot.lon,
      type: spot.type,
    }))

    return {
      spots,
      types: data.result.types,
    }
  } catch (error) {
    console.error('Error fetching spots:', error)
    // フォールバック: 空配列
    return {
      spots: [],
      types: [],
    }
  }
}
