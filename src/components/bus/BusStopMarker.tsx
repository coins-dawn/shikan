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
  isManualMode?: boolean
}

// カスタムアイコンの作成
const createIcon = (isSelected: boolean, order?: number, isManualMode?: boolean) => {
  if (isSelected && order !== undefined) {
    // 選択済み: 数字を画像の上に表示
    const badgeHtml = `
      <div style="position: relative; width: 40px; height: 64px;">
        <div style="
          background: #2563eb;
          border: 3px solid white;
          border-radius: 50%;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0,0,0,0.4);
          position: absolute;
          left: 6px;
          top: 0;
          z-index: 10;
        ">
          <span style="
            color: white;
            font-size: 16px;
            font-weight: bold;
            line-height: 1;
          ">${order}</span>
        </div>
        <img src="/icons/bus-stop2.png" style="
          position: absolute;
          bottom: 0;
          left: 0;
          width: 40px;
          height: 40px;
          filter: brightness(0) saturate(100%) invert(38%) sepia(95%) saturate(2638%) hue-rotate(213deg) brightness(94%) contrast(93%);
        " />
      </div>
    `

    return L.divIcon({
      html: badgeHtml,
      className: 'custom-bus-stop-marker-with-badge',
      iconSize: [40, 64],
      iconAnchor: [20, 64],
      popupAnchor: [0, -64],
    })
  }

  // 未選択: バス停標識アイコン
  // 手動モードの場合は灰色、それ以外は青色
  const filter = isManualMode
    ? 'brightness(0) saturate(100%) invert(64%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(95%) contrast(88%);'
    : 'brightness(0) saturate(100%) invert(38%) sepia(95%) saturate(2638%) hue-rotate(213deg) brightness(94%) contrast(93%);'
  const opacity = isManualMode ? '0.8' : '1'

  const iconHtml = `
    <img src="/icons/bus-stop2.png" style="
      width: 40px;
      height: 40px;
      filter: ${filter};
      opacity: ${opacity};
    " />
  `

  return L.divIcon({
    html: iconHtml,
    className: 'custom-bus-stop-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -40],
  })
}

export default function BusStopMarker({
  stop,
  isSelected,
  selectionOrder,
  onSelect,
  onDeselect,
  isManualMode = false,
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
      icon={createIcon(isSelected, selectionOrder, isManualMode)}
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
