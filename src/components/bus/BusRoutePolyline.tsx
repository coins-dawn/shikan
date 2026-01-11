import { Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import { BusStop, CombusData } from '@/types'
import polyline from '@mapbox/polyline'

interface BusRoutePolylineProps {
  stops: BusStop[]
  combusData?: CombusData | null
  color?: string
  isSelected?: boolean
  onSelectRoute?: () => void
}

// 矢印アイコンを作成（SVGで上向き三角形を使用）
const createArrowIcon = (rotation: number, color: string = '#2563eb', opacity: number = 1.0, size: number = 20) => {
  return L.divIcon({
    className: 'arrow-icon',
    html: `
      <svg width="${size}" height="${size}" viewBox="0 0 20 20" style="transform: rotate(${rotation}deg); opacity: ${opacity};">
        <path d="M10 2 L18 18 L10 14 L2 18 Z" fill="${color}" stroke="${color}" stroke-width="1"/>
      </svg>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
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
  // 北: 0度、東: 90度、南: 180度/-180度、西: -90度
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

// 2点間の距離を計算（簡易的な直線距離、度単位）
const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
  const [lat1, lng1] = point1
  const [lat2, lng2] = point2
  const dLat = lat2 - lat1
  const dLng = lng2 - lng1
  return Math.sqrt(dLat * dLat + dLng * dLng)
}

// 指定位置が停留所から十分離れているかチェック
const isFarFromStops = (position: [number, number], stops: BusStop[], minDistance: number = 0.002): boolean => {
  return stops.every(stop => {
    const stopPos: [number, number] = [stop.lat, stop.lng]
    const distance = calculateDistance(position, stopPos)
    return distance >= minDistance
  })
}

// 2点間の指定位置の点を計算（ratio: 0.0-1.0）
const getPointOnLine = (from: [number, number], to: [number, number], ratio: number): [number, number] => {
  const [lat1, lng1] = from
  const [lat2, lng2] = to
  return [
    lat1 + (lat2 - lat1) * ratio,
    lng1 + (lng2 - lng1) * ratio,
  ]
}

// 線を垂直方向にオフセットした点を計算
const getOffsetPoint = (point: [number, number], angle: number, offsetPixels: number): [number, number] => {
  // 1ピクセル ≈ 0.00001度と仮定（緯度による）
  const offsetDegrees = offsetPixels * 0.00001

  // 線に垂直な方向（+90度）にオフセット
  const offsetAngle = (angle + 90) * (Math.PI / 180)

  return [
    point[0] + Math.sin(offsetAngle) * offsetDegrees,
    point[1] + Math.cos(offsetAngle) * offsetDegrees,
  ]
}

export default function BusRoutePolyline({
  stops,
  combusData,
  color = '#2563eb',
  isSelected = true,
  onSelectRoute,
}: BusRoutePolylineProps) {
  if (stops.length < 2) return null

  // combusDataがある場合は、APIから取得した実際の経路を描画
  if (combusData && combusData['section-list'].length > 0) {
    const allRoutePositions: [number, number][] = []

    // 全セクションのgeometryをデコードして結合
    combusData['section-list'].forEach((section) => {
      const decoded = polyline.decode(section.geometry)
      // decodedは[[lat, lon], ...]形式
      decoded.forEach(([lat, lon]) => {
        allRoutePositions.push([lat, lon])
      })
    })

    // 各停留所に最も近い経路上の座標インデックスを見つける
    const stopIndices = stops.map(stop => {
      const stopPos: [number, number] = [stop.lat, stop.lng]
      let minDistance = Infinity
      let closestIndex = 0

      allRoutePositions.forEach((pos, idx) => {
        const dist = calculateDistance(stopPos, pos)
        if (dist < minDistance) {
          minDistance = dist
          closestIndex = idx
        }
      })

      return closestIndex
    })

    // 停留所間ごとに矢印を配置
    const arrows = []
    for (let i = 0; i < stopIndices.length - 1; i++) {
      const startIdx = stopIndices[i]
      const endIdx = stopIndices[i + 1]
      const sectionLength = endIdx - startIdx

      // 停留所間の中点付近に矢印を配置
      const arrowIdx = startIdx + Math.floor(sectionLength / 2)

      if (arrowIdx > startIdx && arrowIdx < endIdx) {
        const position = allRoutePositions[arrowIdx]

        // 停留所の近くでないことを確認
        if (isFarFromStops(position, stops, 0.002)) {
          // 広域的な方向を計算（前後20点の範囲で）
          const angle = calculateRegionalAngle(allRoutePositions, arrowIdx, 20)

          arrows.push({
            position: position,
            angle: angle,
            key: `arrow-section-${i}`,
          })
        }
      }
    }

    // 最後の停留所から最初の停留所への区間（循環路線の場合）
    if (stopIndices.length > 0) {
      const lastIdx = stopIndices[stopIndices.length - 1]
      const sectionLength = allRoutePositions.length - lastIdx

      if (sectionLength > 0) {
        const arrowIdx = lastIdx + Math.floor(sectionLength / 2)

        if (arrowIdx < allRoutePositions.length) {
          const position = allRoutePositions[arrowIdx]

          if (isFarFromStops(position, stops, 0.002)) {
            const angle = calculateRegionalAngle(allRoutePositions, arrowIdx, 20)

            arrows.push({
              position: position,
              angle: angle,
              key: `arrow-section-last`,
            })
          }
        }
      }
    }

    return (
      <>
        <Polyline
          positions={allRoutePositions}
          pathOptions={{
            color: color,
            weight: 3,
            opacity: 0.7,
          }}
          eventHandlers={
            onSelectRoute && !isSelected
              ? { click: () => onSelectRoute() }
              : undefined
          }
        />
        {arrows.map((arrow) => (
          <Marker
            key={arrow.key}
            position={arrow.position}
            icon={createArrowIcon(arrow.angle, color, isSelected ? 1.0 : 0.3, isSelected ? 20 : 14)}
            interactive={false}
          />
        ))}
      </>
    )
  }

  // combusDataがない場合は従来の直線描画
  const isTwoStopRoute = stops.length === 2

  if (isTwoStopRoute) {
    // 2停留所の場合: 往路と復路を物理的にずらして描画
    const stop1 = [stops[0].lat, stops[0].lng] as [number, number]
    const stop2 = [stops[1].lat, stops[1].lng] as [number, number]

    const outboundAngle = calculateAngle(stop1, stop2)
    const returnAngle = calculateAngle(stop2, stop1)

    // 往路: 線を左にオフセット
    const outboundStop1 = getOffsetPoint(stop1, outboundAngle, -50)
    const outboundStop2 = getOffsetPoint(stop2, outboundAngle, -50)
    const outboundArrowPos = getPointOnLine(outboundStop1, outboundStop2, 0.5)

    // 復路: 線を右にオフセット
    const returnStop1 = getOffsetPoint(stop2, returnAngle, -50)
    const returnStop2 = getOffsetPoint(stop1, returnAngle, -50)
    const returnArrowPos = getPointOnLine(returnStop1, returnStop2, 0.5)

    return (
      <>
        {/* 往路 */}
        <Polyline
          positions={[outboundStop1, outboundStop2]}
          pathOptions={{
            color: color,
            weight: 3,
            opacity: 0.7,
          }}
          eventHandlers={
            onSelectRoute && !isSelected
              ? { click: () => onSelectRoute() }
              : undefined
          }
        />
        <Marker
          position={outboundArrowPos}
          icon={createArrowIcon(outboundAngle, color, isSelected ? 1.0 : 0.3, isSelected ? 20 : 14)}
          interactive={false}
        />

        {/* 復路 */}
        <Polyline
          positions={[returnStop1, returnStop2]}
          pathOptions={{
            color: color,
            weight: 3,
            opacity: 0.7,
          }}
          eventHandlers={
            onSelectRoute && !isSelected
              ? { click: () => onSelectRoute() }
              : undefined
          }
        />
        <Marker
          position={returnArrowPos}
          icon={createArrowIcon(returnAngle, color, isSelected ? 1.0 : 0.3, isSelected ? 20 : 14)}
          interactive={false}
        />
      </>
    )
  }

  // 3つ以上の停留所の場合: 通常の循環ルート
  const positions = stops.map((stop) => [stop.lat, stop.lng] as [number, number])
  positions.push([stops[0].lat, stops[0].lng])

  const arrows = []
  for (let i = 0; i < positions.length - 1; i++) {
    const from = positions[i]
    const to = positions[i + 1]
    const arrowPosition = getPointOnLine(from, to, 0.5)
    const angle = calculateAngle(from, to)

    arrows.push({
      position: arrowPosition,
      angle: angle,
      key: `arrow-${i}`,
    })
  }

  return (
    <>
      <Polyline
        positions={positions}
        pathOptions={{
          color: color,
          weight: isSelected ? 3 : 1,
          opacity: isSelected ? 0.7 : 0.3,
        }}
        eventHandlers={
          onSelectRoute && !isSelected
            ? { click: () => onSelectRoute() }
            : undefined
        }
      />
      {arrows.map((arrow) => (
        <Marker
          key={arrow.key}
          position={arrow.position}
          icon={createArrowIcon(arrow.angle, color, isSelected ? 1.0 : 0.3, isSelected ? 20 : 8)}
          interactive={false}
        />
      ))}
    </>
  )
}
