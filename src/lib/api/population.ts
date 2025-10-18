import { PopulationGeoJSON } from '@/types'

/**
 * 人口分布メッシュデータを取得
 * public/data/population-mesh.json から静的データを読み込む
 */
export async function fetchPopulationData(): Promise<PopulationGeoJSON | null> {
  try {
    const response = await fetch('/data/population-mesh.json', {
      cache: 'force-cache', // ビルド時にキャッシュ
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch population data: ${response.status}`)
    }

    const data: PopulationGeoJSON = await response.json()

    return data
  } catch (error) {
    console.error('Error fetching population data:', error)
    return null
  }
}
