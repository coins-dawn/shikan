import { BusStop } from '@/types'

interface BusStopAPIResponse {
  result: {
    'combus-stops': Array<{
      id: string
      lat: number
      lon: number
      name: string
    }>
  }
  status: string
}

const API_URL = 'https://prometheus-h24i.onrender.com/combus/stops'

export async function fetchBusStops(): Promise<BusStop[]> {
  try {
    const response = await fetch(API_URL, {
      cache: 'force-cache', // ビルド時にキャッシュ
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch bus stops: ${response.status}`)
    }

    const data: BusStopAPIResponse = await response.json()

    if (data.status !== 'OK') {
      throw new Error(`API returned error status: ${data.status}`)
    }

    // APIのlon -> lng に変換
    return data.result['combus-stops'].map((stop) => ({
      id: stop.id,
      name: stop.name,
      lat: stop.lat,
      lng: stop.lon,
    }))
  } catch (error) {
    console.error('Error fetching bus stops:', error)
    // フォールバック: ダミーデータ
    return [
      { id: '1', name: '停留所A', lat: 36.65742, lng: 137.17421 },
      { id: '2', name: '停留所B', lat: 36.68936, lng: 137.18519 },
      { id: '3', name: '停留所C', lat: 36.67738, lng: 137.23892 },
      { id: '4', name: '停留所D', lat: 36.65493, lng: 137.24001 },
      { id: '5', name: '停留所E', lat: 36.63964, lng: 137.21958 },
    ]
  }
}
