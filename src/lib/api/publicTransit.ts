import { PublicTransitResponse } from '@/types'

/**
 * ビルド時に生成された静的JSONファイルから公共交通データを取得
 */
export async function fetchPublicTransit(): Promise<PublicTransitResponse> {
  const response = await fetch('/data/ptrans.json', {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to fetch public transit: ${response.status}`)
  }

  return response.json()
}
