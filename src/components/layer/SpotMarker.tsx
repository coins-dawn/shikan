'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { Spot } from '@/types'
import { getSpotLabel } from '@/lib/utils/spotLabels'
import { getSpotIconPath } from '@/lib/utils/spotIcons'

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
  const iconDef = getSpotIconPath(type)

  // 種別ごとに適したアイコンを使用
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="${iconDef.viewBox || '0 0 24 24'}" width="28" height="28">
      <circle cx="12" cy="12" r="11" fill="${color}" stroke="white" stroke-width="2"/>
      ${iconDef.path}
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'spot-marker',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14],
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
