'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { BusStop } from '@/types'

interface BusStopMarkerProps {
  stop: BusStop
  isSelected: boolean
  selectionOrder?: number
  onSelect: (stop: BusStop) => void
}

// カスタムアイコンの作成
const createIcon = (isSelected: boolean, order?: number) => {
  const color = isSelected ? '#2563eb' : '#94a3b8'
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
      ${isSelected && order !== undefined ? `<text x="12" y="10" text-anchor="middle" font-size="8" fill="white" font-weight="bold">${order}</text>` : ''}
    </svg>
  `

  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  })
}

export default function BusStopMarker({
  stop,
  isSelected,
  selectionOrder,
  onSelect,
}: BusStopMarkerProps) {
  return (
    <Marker
      position={[stop.lat, stop.lng]}
      icon={createIcon(isSelected, selectionOrder)}
      eventHandlers={{
        click: () => onSelect(stop),
      }}
    >
      <Popup>
        <div className="text-sm">
          <p className="font-semibold">{stop.name}</p>
          {isSelected && selectionOrder !== undefined && (
            <p className="text-xs text-gray-600 mt-1">選択順: {selectionOrder}</p>
          )}
        </div>
      </Popup>
    </Marker>
  )
}
