'use client'

import { Marker, Popup } from 'react-leaflet'
import L from 'leaflet'
import { BusStop } from '@/types'

interface BusStopMarkerProps {
  stop: BusStop
  isSelected: boolean
  selectionOrder?: number
  onSelect: (stop: BusStop) => void
  onDeselect?: (stop: BusStop) => void
}

// カスタムアイコンの作成
const createIcon = (isSelected: boolean, order?: number) => {
  const color = isSelected ? '#2563eb' : '#94a3b8'

  if (isSelected && order !== undefined) {
    // 選択済み: 数字をピンの上側に大きく表示
    const badgeHtml = `
      <div style="position: relative; width: 32px; height: 64px;">
        <div style="
          background: ${color};
          border: 3px solid white;
          border-radius: 50%;
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          position: absolute;
          left: 0;
          top: 0;
        ">
          <span style="
            color: white;
            font-size: 18px;
            font-weight: bold;
            line-height: 1;
          ">${order}</span>
        </div>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32" style="position: absolute; bottom: 0; left: 0;">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
        </svg>
      </div>
    `

    return L.divIcon({
      html: badgeHtml,
      className: 'custom-marker-with-badge',
      iconSize: [32, 64],
      iconAnchor: [16, 64],
      popupAnchor: [0, -64],
    })
  }

  // 未選択: 通常のピン
  const svgIcon = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${color}" width="32" height="32">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
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
  onDeselect,
}: BusStopMarkerProps) {
  const handleClick = () => {
    if (isSelected) {
      // 選択済みの場合は選択解除
      if (onDeselect) {
        onDeselect(stop)
      }
    } else {
      // 未選択の場合は選択
      onSelect(stop)
    }
  }

  const handleDeselect = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (onDeselect) {
      onDeselect(stop)
    }
  }

  return (
    <Marker
      position={[stop.lat, stop.lng]}
      icon={createIcon(isSelected, selectionOrder)}
      eventHandlers={{
        click: handleClick,
      }}
    >
      {isSelected && (
        <Popup>
          <div className="text-sm">
            <p className="font-semibold">{stop.name}</p>
            {selectionOrder !== undefined && (
              <p className="text-xs text-gray-600 mt-1">選択順: {selectionOrder}</p>
            )}
            {onDeselect && (
              <button
                onClick={handleDeselect}
                className="mt-2 w-full px-3 py-1 text-xs font-medium text-white bg-red-500 rounded hover:bg-red-600 transition-colors"
              >
                選択を解除
              </button>
            )}
          </div>
        </Popup>
      )}
    </Marker>
  )
}
