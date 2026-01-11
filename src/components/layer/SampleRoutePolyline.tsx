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

// 2点間の距離を計算（Haversine公式、メートル単位）
const calculateDistance = (from: [number, number], to: [number, number]): number => {
  const [lat1, lon1] = from
  const [lat2, lon2] = to

  const R = 6371e3 // 地球の半径（メートル）
  const φ1 = lat1 * Math.PI / 180
  const φ2 = lat2 * Math.PI / 180
  const Δφ = (lat2 - lat1) * Math.PI / 180
  const Δλ = (lon2 - lon1) * Math.PI / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}

// 経路を垂直方向にオフセット（左側にずらす）
const offsetPolyline = (positions: [number, number][], offsetMeters: number): [number, number][] => {
  if (positions.length < 2) return positions

  const offsetPositions: [number, number][] = []

  for (let i = 0; i < positions.length; i++) {
    const [lat, lon] = positions[i]

    // 前後のセグメントから方向を計算
    let direction = 0
    if (i === 0) {
      // 最初の点: 次の点との方向
      direction = calculateAngle(positions[i], positions[i + 1])
    } else if (i === positions.length - 1) {
      // 最後の点: 前の点との方向
      direction = calculateAngle(positions[i - 1], positions[i])
    } else {
      // 中間点: 前後の点の平均方向
      const dir1 = calculateAngle(positions[i - 1], positions[i])
      const dir2 = calculateAngle(positions[i], positions[i + 1])
      direction = (dir1 + dir2) / 2
    }

    // 進行方向に対して左側（-90度）にオフセット
    const offsetAngle = (direction - 90) * Math.PI / 180

    // オフセット距離を緯度経度の差分に変換（近似）
    const latOffset = (offsetMeters / 111000) * Math.cos(offsetAngle)
    const lonOffset = (offsetMeters / (111000 * Math.cos(lat * Math.PI / 180))) * Math.sin(offsetAngle)

    offsetPositions.push([lat + latOffset, lon + lonOffset])
  }

  return offsetPositions
}

// 矢印が目的地に近すぎるかチェック（400m以内なら除外）
const isTooCloseToGoal = (arrowPosition: [number, number], goalPosition: [number, number], threshold = 400): boolean => {
  return calculateDistance(arrowPosition, goalPosition) < threshold
}

// 1600mごとに矢印を配置する位置と角度を計算
const calculateArrowPositionsForSections = (
  sections: Array<{ geometry: string }>,
  goalPosition?: [number, number],
  offsetMeters?: number
) => {
  const arrows: Array<{ position: [number, number]; angle: number; key: string }> = []
  const interval = 1600 // 1600m間隔

  sections.forEach((section, sectionIndex) => {
    if (!section.geometry) return

    // セクションのgeometryをデコード
    const decoded = polyline.decode(section.geometry)
    let positions: [number, number][] = decoded.map(([lat, lon]) => [lat, lon])

    if (positions.length < 2) return

    // オフセットが指定されている場合は適用
    if (offsetMeters) {
      positions = offsetPolyline(positions, offsetMeters)
    }

    let accumulatedDistance = 0
    let nextArrowDistance = interval

    for (let i = 0; i < positions.length - 1; i++) {
      const segmentDistance = calculateDistance(positions[i], positions[i + 1])

      // このセグメント内で矢印を配置すべき位置を探す
      while (accumulatedDistance + segmentDistance >= nextArrowDistance) {
        // セグメント内での矢印位置の割合を計算
        const remainingToArrow = nextArrowDistance - accumulatedDistance
        const ratio = remainingToArrow / segmentDistance

        // 補間して矢印の位置を計算
        const arrowLat = positions[i][0] + (positions[i + 1][0] - positions[i][0]) * ratio
        const arrowLon = positions[i][1] + (positions[i + 1][1] - positions[i][1]) * ratio
        const arrowPosition: [number, number] = [arrowLat, arrowLon]

        // 目的地と近すぎる場合はスキップ
        if (goalPosition && isTooCloseToGoal(arrowPosition, goalPosition)) {
          nextArrowDistance += interval
          continue
        }

        // 広域的な角度を計算するため、最も近いインデックスを見つける
        const closestIndex = ratio < 0.5 ? i : i + 1
        const angle = calculateRegionalAngle(positions, closestIndex, Math.min(10, Math.floor(positions.length / 3)))

        arrows.push({
          position: arrowPosition,
          angle,
          key: `arrow-section-${sectionIndex}-${arrows.length}`,
        })

        nextArrowDistance += interval
      }

      accumulatedDistance += segmentDistance
    }
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

  // 導入前の経路を5mほど左側にオフセット（導入後の経路と重なりを避ける）
  const offsetOriginalPositions = originalPositions.length > 0
    ? offsetPolyline(originalPositions, 5)
    : []

  // ゴール地点（最終目的地）の座標を取得
  const originalGoal: [number, number] = [
    routePair.original.to.coord.lat,
    routePair.original.to.coord.lon
  ]
  const withCombusGoal: [number, number] = [
    routePair['with-combus'].to.coord.lat,
    routePair['with-combus'].to.coord.lon
  ]

  // geometryデータがない場合は何も表示しない
  if (originalPositions.length === 0 && routePair['with-combus'].sections.length === 0) {
    return null
  }

  // 矢印の位置を計算（目的地の座標を渡して近すぎる矢印を除外、5mオフセット適用）
  const originalArrows = calculateArrowPositionsForSections(routePair.original.sections, originalGoal, 5)

  return (
    <>
      {/* 導入前のルート（グレー） - 先に描画（背面） */}
      {offsetOriginalPositions.length > 0 && (
        <>
          <Polyline
            positions={offsetOriginalPositions}
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
        const weight = isCombus ? 8 : 4

        // 1600mごとに矢印を配置
        const interval = 1600
        const sectionArrows: Array<{ position: [number, number]; angle: number }> = []
        let accumulatedDistance = 0
        let nextArrowDistance = interval

        for (let i = 0; i < positions.length - 1; i++) {
          const segmentDistance = calculateDistance(positions[i], positions[i + 1])

          while (accumulatedDistance + segmentDistance >= nextArrowDistance) {
            const remainingToArrow = nextArrowDistance - accumulatedDistance
            const ratio = remainingToArrow / segmentDistance

            const arrowLat = positions[i][0] + (positions[i + 1][0] - positions[i][0]) * ratio
            const arrowLon = positions[i][1] + (positions[i + 1][1] - positions[i][1]) * ratio
            const arrowPosition: [number, number] = [arrowLat, arrowLon]

            // 目的地と近すぎる場合はスキップ
            if (!isTooCloseToGoal(arrowPosition, withCombusGoal)) {
              const closestIndex = ratio < 0.5 ? i : i + 1
              const angle = calculateRegionalAngle(positions, closestIndex, Math.min(10, Math.floor(positions.length / 3)))

              sectionArrows.push({
                position: arrowPosition,
                angle,
              })
            }

            nextArrowDistance += interval
          }

          accumulatedDistance += segmentDistance
        }

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
            {sectionArrows.map((arrow, arrowIndex) => (
              <Marker
                key={`with-combus-arrow-${index}-${arrowIndex}`}
                position={arrow.position}
                icon={createArrowIcon(arrow.angle, color)}
                interactive={false}
              />
            ))}
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
