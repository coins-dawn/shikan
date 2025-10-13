import { Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import { BusStop } from '@/types'

interface BusRoutePolylineProps {
  stops: BusStop[]
}

// 矢印アイコンを作成（SVGで上向き三角形を使用）
const createArrowIcon = (rotation: number) => {
  return L.divIcon({
    className: 'arrow-icon',
    html: `
      <svg width="20" height="20" viewBox="0 0 20 20" style="transform: rotate(${rotation}deg);">
        <path d="M10 2 L18 18 L10 14 L2 18 Z" fill="#2563eb" stroke="#2563eb" stroke-width="1"/>
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
  // 北: 0度、東: 90度、南: 180度/-180度、西: -90度
  const angle = Math.atan2(dx, dy) * (180 / Math.PI)

  return angle
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

export default function BusRoutePolyline({ stops }: BusRoutePolylineProps) {
  if (stops.length < 2) return null

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
            color: '#2563eb',
            weight: 3,
            opacity: 0.7,
          }}
        />
        <Marker
          position={outboundArrowPos}
          icon={createArrowIcon(outboundAngle)}
          interactive={false}
        />

        {/* 復路 */}
        <Polyline
          positions={[returnStop1, returnStop2]}
          pathOptions={{
            color: '#2563eb',
            weight: 3,
            opacity: 0.7,
          }}
        />
        <Marker
          position={returnArrowPos}
          icon={createArrowIcon(returnAngle)}
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
          color: '#2563eb',
          weight: 3,
          opacity: 0.7,
        }}
      />
      {arrows.map((arrow) => (
        <Marker
          key={arrow.key}
          position={arrow.position}
          icon={createArrowIcon(arrow.angle)}
          interactive={false}
        />
      ))}
    </>
  )
}
