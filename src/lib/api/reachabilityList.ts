import { ReachabilityListResponse } from '@/types'

/**
 * ビルド時に生成された静的JSONファイルから到達圏データを取得
 * prebuildスクリプトで生成された /data/reachability.json を読み込む
 */
export async function fetchReachabilityList(): Promise<ReachabilityListResponse> {
  const response = await fetch('/data/reachability.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch reachability list: ${response.status}`)
  }

  return response.json()
}
