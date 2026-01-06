import { Polyline, Marker, Popup } from 'react-leaflet'
import polyline from '@mapbox/polyline'
import L from 'leaflet'
import { PublicTransitResponse } from '@/types'
import { Fragment } from 'react'

interface PublicTransitLayerProps {
  data: PublicTransitResponse | null
  isVisible: boolean
}

// 路線インデックスから色を決定（12色のパレットをローテーション）
const getRouteColor = (index: number): string => {
  const colors = [
    '#e11d48', // rose-600
    '#f97316', // orange-500
    '#f59e0b', // amber-500
    '#84cc16', // lime-500
    '#10b981', // emerald-500
    '#14b8a6', // teal-500
    '#06b6d4', // cyan-500
    '#3b82f6', // blue-500
    '#6366f1', // indigo-500
    '#8b5cf6', // violet-500
    '#a855f7', // purple-500
    '#ec4899', // pink-500
  ]
  return colors[index % colors.length]
}

type ArcPathOptions = {
  cx: number
  cy: number
  r: number
  segments: number
}

const createCircleSegments = ({
  cx,
  cy,
  r,
  segments,
}: ArcPathOptions): string[] => {
  if (segments < 1) {
    throw new Error('segments must be >= 1')
  }

  const paths: string[] = []
  const angleStep = (2 * Math.PI) / segments

  for (let i = 0; i < segments; i++) {
    const startAngle = i * angleStep - Math.PI / 2
    const endAngle = (i + 1) * angleStep - Math.PI / 2

    const x1 = cx + r * Math.cos(startAngle)
    const y1 = cy + r * Math.sin(startAngle)

    const x2 = cx + r * Math.cos(endAngle)
    const y2 = cy + r * Math.sin(endAngle)

    const largeArcFlag = angleStep > Math.PI ? 1 : 0

    const d = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ')

    paths.push(d)
  }

  return paths
}

// 公共交通停留所のアイコンを作成（円形、複数路線対応）
const createStopIcon = (lineIndices: number[]) => {
  const colors = lineIndices.map((index) => getRouteColor(index))
  const paths = createCircleSegments({
    cx: 12,
    cy: 12,
    r: 8,
    segments: lineIndices.length,
  })

const svgIcon = `
  <svg viewBox="0 0 24 24" width="20" height="20">
    ${
      paths.length === 1
        ? `
          <circle
            cx="12"
            cy="12"
            r="8"
            fill="${colors[0]}"
          />
        `
        : paths
            .map(
              (d, i) => `
                <path
                  d="${d}"
                  fill="${colors[i]}"
                />
              `
            )
            .join('')
    }
    <circle
      cx="12"
      cy="12"
      r="8"
      fill="none"
      stroke="white"
      stroke-width="2"
    />
  </svg>
`

  return L.divIcon({
    html: svgIcon,
    className: 'public-transit-stop-marker',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
  })
}

// 極座標からデカルト座標への変換
function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  }
}

export default function PublicTransitLayer({ data, isVisible }: PublicTransitLayerProps) {
  if (!data || !isVisible) return null

  return (
    <>
      {data.result.routes.map((route, routeIndex) => {
        // Polylineエンコード文字列をデコード
        const positions = polyline.decode(route.geometry) as [number, number][]
        const color = getRouteColor(routeIndex)

        return (
          <Fragment key={`ptrans-route-${routeIndex}`}>
            {/* 路線 */}
            <Polyline
              positions={positions}
              pathOptions={{
                color: color,
                weight: 3,
                opacity: 0.6,
              }}
            />
          </Fragment>
        )
      })}

      {/* 停留所マーカー */}
      {data.result.stops.map((stop, stopIndex) => {
        const lineIndices = stop.lines.map((line) => line.index)
        return (
          <Marker
            key={`ptrans-stop-${stopIndex}`}
            position={[stop.lat, stop.lon]}
            icon={createStopIcon(lineIndices)}
          >
            <Popup>
              <div className="text-sm">
                <div className="font-bold mb-2">{stop.name}</div>
                {stop.lines.map((line, lineIndex) => {
                  const color = getRouteColor(line.index)
                  return (
                    <div key={lineIndex} className="mb-3 last:mb-0">
                      <div
                        className="text-xs font-semibold mb-1 flex items-center gap-1"
                      >
                        <span
                          className="inline-block w-3 h-3 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        {line.name}
                      </div>
                      {line.times && line.times.length > 0 && (
                        <div className="text-xs">
                          <div className="font-medium mb-1">停車時刻:</div>
                          <div className="flex flex-wrap gap-1">
                            {line.times.map((time, timeIndex) => (
                              <span
                                key={timeIndex}
                                className="bg-gray-100 px-2 py-0.5 rounded"
                              >
                                {time}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </Popup>
          </Marker>
        )
      })}
    </>
  )
}
