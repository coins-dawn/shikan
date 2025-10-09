'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Spot } from '@/types'
import { getSpotLabel } from '@/lib/spotLabels'

interface SpotMarkerProps {
  spot: Spot
}

// スポットタイプごとの色定義
const SPOT_COLORS: Record<string, string> = {
  hospital: '#ef4444', // 赤
  shopping: '#3b82f6', // 青
  'public-facility': '#10b981', // 緑
}

// デフォルト色
const DEFAULT_COLOR = '#6b7280' // グレー

// タイプごとのアイコンを作成
const createSpotIcon = (type: string) => {
  const color = SPOT_COLORS[type] || DEFAULT_COLOR

  // 停留所マーカーと区別するため、四角形のアイコンを使用
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="24" height="24">
      <rect x="3" y="3" width="18" height="18" rx="3" fill="${color}" stroke="white" stroke-width="2"/>
      <circle cx="12" cy="12" r="4" fill="white"/>
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'spot-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
    popupAnchor: [0, -12],
  })
}

export default function SpotMarker({ spot }: SpotMarkerProps) {
  return (
    <Marker position={[spot.lat, spot.lng]} icon={createSpotIcon(spot.type)}>
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">{spot.name}</p>
          <p className="text-xs text-gray-600 mt-1">
            種別: {getSpotLabel(spot.type)}
          </p>
        </div>
      </Popup>
    </Marker>
  )
}
