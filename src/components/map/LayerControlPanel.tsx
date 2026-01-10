'use client'

interface LayerControlPanelProps {
  showPublicTransit: boolean
  onTogglePublicTransit: () => void
  showPopulationMesh: boolean
  onTogglePopulationMesh: () => void
}

export default function LayerControlPanel({
  showPublicTransit,
  onTogglePublicTransit,
  showPopulationMesh,
  onTogglePopulationMesh,
}: LayerControlPanelProps) {
  return (
    <div
      className="top-4 left-4 absolute p-3 bg-white rounded-lg shadow-lg"
    >
      <div className="flex flex-row gap-2">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPublicTransit}
            onChange={onTogglePublicTransit}
            className="cursor-pointer"
          />
          <span className="text-sm text-gray-700">公共交通を表示</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPopulationMesh}
            onChange={onTogglePopulationMesh}
            className="cursor-pointer"
          />
          <span className="text-sm text-gray-700">人口メッシュを表示</span>
        </label>
      </div>
    </div>
  )
}
