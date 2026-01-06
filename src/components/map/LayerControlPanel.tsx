'use client'

interface LayerControlPanelProps {
  showPublicTransit: boolean
  onTogglePublicTransit: () => void
}

export default function LayerControlPanel({
  showPublicTransit,
  onTogglePublicTransit,
}: LayerControlPanelProps) {
  return (
    <div className="leaflet-top leaflet-right">
      <div
        className="leaflet-control leaflet-bar"
        style={{
          marginTop: '10px',
          backgroundColor: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          boxShadow: '0 1px 5px rgba(0,0,0,0.4)',
        }}
      >
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPublicTransit}
            onChange={onTogglePublicTransit}
            className="cursor-pointer"
          />
          <span className="text-sm text-gray-700">公共交通を表示</span>
        </label>
      </div>
    </div>
  )
}
