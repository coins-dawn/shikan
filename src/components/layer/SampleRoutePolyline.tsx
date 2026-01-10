import { Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import { RoutePair } from '@/types'
import polyline from '@mapbox/polyline'

interface SampleRoutePolylineProps {
  routePair: RoutePair
}

// 矢印アイコンを作成（SVGで上向き三角形を使用）
const createArrowIcon = (rotation: number, color: string) => {
  return L.divIcon({
    className: 'arrow-icon',
    html: `
      <svg width="20" height="20" viewBox="0 0 20 20" style="transform: rotate(${rotation}deg);">
        <path d="M10 2 L18 18 L10 14 L2 18 Z" fill="${color}" stroke="${color}" stroke-width="1"/>
      </svg>
    `,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  })
}

// 2点間の角度を計算（SVG三角形が上向きを基準として）
const calculateAngle = (from: [number, number], to: [number, number]): number => {
  const [lat1, lng1] = from
  const [lat2, lng2] = to

  // 経度(x)と緯度(y)の差分
  const dx = lng2 - lng1  // 経度: 東西方向
  const dy = lat2 - lat1  // 緯度: 南北方向

  // atan2(dx, dy)で角度を計算（上向きを0度とするため、引数の順序を逆に）
  const angle = Math.atan2(dx, dy) * (180 / Math.PI)

  return angle
}

// 経路上の指定位置における広域的な方向を計算（前後の点から平均方向を算出）
const calculateRegionalAngle = (positions: [number, number][], index: number, lookAheadCount: number = 20): number => {
  // 前後のlookAheadCount点の範囲で方向を計算
  const startIdx = Math.max(0, index - lookAheadCount)
  const endIdx = Math.min(positions.length - 1, index + lookAheadCount)

  // 始点と終点で大まかな方向を計算
  const from = positions[startIdx]
  const to = positions[endIdx]

  return calculateAngle(from, to)
}

// セクションごとに矢印を配置する位置と角度を計算
const calculateArrowPositionsForSections = (sections: Array<{ geometry: string }>) => {
  const arrows: Array<{ position: [number, number]; angle: number; key: string }> = []

  sections.forEach((section, sectionIndex) => {
    if (!section.geometry) return

    // セクションのgeometryをデコード
    const decoded = polyline.decode(section.geometry)
    const positions: [number, number][] = decoded.map(([lat, lon]) => [lat, lon])

    if (positions.length < 2) return

    // セクションの中間点に矢印を配置
    const midIndex = Math.floor(positions.length / 2)
    const position = positions[midIndex]

    // 広域的な角度を計算
    const angle = calculateRegionalAngle(positions, midIndex, Math.min(10, Math.floor(positions.length / 3)))

    arrows.push({
      position,
      angle,
      key: `arrow-section-${sectionIndex}`,
    })
  })

  return arrows
}

export default function SampleRoutePolyline({ routePair }: SampleRoutePolylineProps) {
  // 導入前（original）のルートを処理
  const originalPositions: [number, number][] = []
  if (routePair.original.geometry) {
    const decoded = polyline.decode(routePair.original.geometry)
    decoded.forEach(([lat, lon]) => {
      originalPositions.push([lat, lon])
    })
  }

  // 導入後（with-combus）のルートを処理
  const withCombusPositions: [number, number][] = []
  if (routePair['with-combus'].geometry) {
    const decoded = polyline.decode(routePair['with-combus'].geometry)
    decoded.forEach(([lat, lon]) => {
      withCombusPositions.push([lat, lon])
    })
  }

  // geometryデータがない場合は何も表示しない
  if (originalPositions.length === 0 && withCombusPositions.length === 0) {
    return null
  }

  // 矢印の位置を計算（セクションごと）
  const originalArrows = calculateArrowPositionsForSections(routePair.original.sections)
  const withCombusArrows = calculateArrowPositionsForSections(routePair['with-combus'].sections)

  return (
    <>
      {/* 導入前のルート（グレー） - 先に描画（背面） */}
      {originalPositions.length > 0 && (
        <>
          <Polyline
            positions={originalPositions}
            pathOptions={{
              color: '#6B7280',
              weight: 4,
              opacity: 0.7,
            }}
          />
          {originalArrows.map((arrow) => (
            <Marker
              key={arrow.key}
              position={arrow.position}
              icon={createArrowIcon(arrow.angle, '#6B7280')}
              interactive={false}
            />
          ))}
        </>
      )}

      {/* 導入後のルート（グリーン） - 後に描画（前面） */}
      {withCombusPositions.length > 0 && (
        <>
          <Polyline
            positions={withCombusPositions}
            pathOptions={{
              color: '#22C55E',
              weight: 4,
              opacity: 0.7,
            }}
          />
          {withCombusArrows.map((arrow) => (
            <Marker
              key={arrow.key}
              position={arrow.position}
              icon={createArrowIcon(arrow.angle, '#22C55E')}
              interactive={false}
            />
          ))}
        </>
      )}
    </>
  )
}
