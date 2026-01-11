import React from 'react'
import { Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import { RoutePair } from '@/types'
import polyline from '@mapbox/polyline'

interface SampleRoutePolylineProps {
  routePair: RoutePair
  goalColor?: string
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

// ゴールマーカーアイコンを作成（旗のアイコン、スポットマーカーと同じスタイル）
const createGoalIcon = (color: string) => {
  return L.divIcon({
    className: 'goal-icon',
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 28 28" width="28" height="28">
        <circle cx="14" cy="14" r="13" fill="${color}" stroke="white" stroke-width="2"/>
        <g transform="translate(5, 4) scale(0.035)">
          <polygon points="448.488,138.033 448.709,137.942 250.754,55.23 175.476,23.705 175.476,23.774 175.307,23.705 175.307,252.176 334.947,185.475 448.644,138.098" fill="white"/>
          <path d="M149.725,440.197V0h-44.693v441.054c-24.906,5.184-41.742,18.184-41.742,34.246c0,20.922,28.496,36.701,66.282,36.701c37.787,0,66.279-15.778,66.279-36.701C195.852,458.303,177.045,444.701,149.725,440.197z" fill="white"/>
        </g>
      </svg>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
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

export default function SampleRoutePolyline({ routePair, goalColor = '#22C55E' }: SampleRoutePolylineProps) {
  // 導入前（original）のルートを処理
  const originalPositions: [number, number][] = []
  if (routePair.original.geometry) {
    const decoded = polyline.decode(routePair.original.geometry)
    decoded.forEach(([lat, lon]) => {
      originalPositions.push([lat, lon])
    })
  }

  // geometryデータがない場合は何も表示しない
  if (originalPositions.length === 0 && routePair['with-combus'].sections.length === 0) {
    return null
  }

  // 矢印の位置を計算（セクションごと）
  const originalArrows = calculateArrowPositionsForSections(routePair.original.sections)

  // ゴール地点（最終目的地）の座標を取得
  const originalGoal: [number, number] = [
    routePair.original.to.coord.lat,
    routePair.original.to.coord.lon
  ]
  const withCombusGoal: [number, number] = [
    routePair['with-combus'].to.coord.lat,
    routePair['with-combus'].to.coord.lon
  ]

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
          {/* 導入前のゴールマーカー */}
          <Marker
            position={originalGoal}
            icon={createGoalIcon('#6B7280')}
            interactive={false}
            zIndexOffset={1000}
          />
        </>
      )}

      {/* 導入後のルート - セクションごとに描画（コミバス区間は青・太線、それ以外は緑・通常線） */}
      {routePair['with-combus'].sections.map((section, index) => {
        if (!section.geometry) return null

        const decoded = polyline.decode(section.geometry)
        const positions: [number, number][] = decoded.map(([lat, lon]) => [lat, lon])

        if (positions.length === 0) return null

        const isCombus = section.mode === 'combus'
        const color = isCombus ? '#2563eb' : '#22C55E'
        const weight = 4

        // セクションの中間点に矢印を配置
        const midIndex = Math.floor(positions.length / 2)
        const position = positions[midIndex]
        const angle = calculateRegionalAngle(positions, midIndex, Math.min(10, Math.floor(positions.length / 3)))

        return (
          <React.Fragment key={`with-combus-section-${index}`}>
            <Polyline
              positions={positions}
              pathOptions={{
                color,
                weight,
                opacity: 0.7,
              }}
            />
            <Marker
              position={position}
              icon={createArrowIcon(angle, color)}
              interactive={false}
            />
          </React.Fragment>
        )
      })}

      {/* 導入後のゴールマーカー */}
      <Marker
        position={withCombusGoal}
        icon={createGoalIcon(goalColor)}
        interactive={false}
        zIndexOffset={1000}
      />
    </>
  )
}
