import { MultiPolygon, FacilitySpot } from '@/types'

/**
 * 点がMultiPolygon内に含まれるかを判定
 * Ray Casting Algorithmを使用
 */
function pointInPolygon(
  point: [number, number],
  polygon: number[][][]
): boolean {
  // 外側のリング（最初の要素）のみをチェック
  const ring = polygon[0]
  let inside = false
  const [lon, lat] = point

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]

    const intersect =
      yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi

    if (intersect) inside = !inside
  }

  return inside
}

/**
 * 点がMultiPolygon内に含まれるかを判定
 */
export function isPointInMultiPolygon(
  lat: number,
  lon: number,
  multiPolygon: MultiPolygon
): boolean {
  const point: [number, number] = [lon, lat]

  for (const polygon of multiPolygon.coordinates) {
    if (pointInPolygon(point, polygon)) {
      return true
    }
  }

  return false
}

/**
 * 到達圏内のスポット数を計算
 */
export function countReachableSpots(
  spots: FacilitySpot[],
  reachability: MultiPolygon
): number {
  return spots.filter((spot) =>
    isPointInMultiPolygon(spot.coord.lat, spot.coord.lon, reachability)
  ).length
}

/**
 * MultiPolygonの面積を計算（平方km）
 * 簡易的な球面三角法を使用
 */
export function calculateMultiPolygonArea(multiPolygon: MultiPolygon): number {
  let totalArea = 0

  for (const polygon of multiPolygon.coordinates) {
    // 外側のリング（最初の要素）の面積を計算
    const ring = polygon[0]
    totalArea += calculatePolygonArea(ring)
  }

  return totalArea
}

/**
 * ポリゴンの面積を計算（平方km）
 * Shoelace formula（靴紐公式）を使用し、緯度経度を概算距離に変換
 */
function calculatePolygonArea(ring: number[][]): number {
  if (ring.length < 3) return 0

  let area = 0
  const earthRadiusKm = 6371

  for (let i = 0; i < ring.length - 1; i++) {
    const [lon1, lat1] = ring[i]
    const [lon2, lat2] = ring[i + 1]

    // ラジアンに変換
    const lat1Rad = (lat1 * Math.PI) / 180
    const lat2Rad = (lat2 * Math.PI) / 180
    const lon1Rad = (lon1 * Math.PI) / 180
    const lon2Rad = (lon2 * Math.PI) / 180

    // Shoelace formula
    area += lon1Rad * lat2Rad - lon2Rad * lat1Rad
  }

  area = Math.abs(area) / 2
  // 球面への補正係数を適用
  area *= earthRadiusKm * earthRadiusKm * Math.cos((ring[0][1] * Math.PI) / 180)

  return area
}
