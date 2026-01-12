'use client'

import { useState } from 'react'
import HelpDialog from '@/components/ui/HelpDialog'
import { HELP_CONTENT } from '@/lib/constants/helpContent'

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
  const [isHelpOpen, setIsHelpOpen] = useState(false)

  return (
    <div className="top-4 left-4 absolute p-3 bg-white rounded-lg shadow-lg z-[50] w-80 justify-between">
      <div className="flex flex-row items-center gap-2">
        <div className="flex flex-row gap-1">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPublicTransit}
              onChange={onTogglePublicTransit}
              className="cursor-pointer"
            />
            <span className="text-sm text-gray-700">公共交通を表示</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPopulationMesh}
              onChange={onTogglePopulationMesh}
              className="cursor-pointer"
            />
            <span className="text-sm text-gray-700">人口メッシュを表示</span>
          </label>
        </div>
        <button
          onClick={() => setIsHelpOpen(!isHelpOpen)}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600 font-bold text-sm transition-colors"
          aria-label="ヘルプ"
        >
          ?
        </button>
      </div>

      {/* ヘルプダイアログ */}
      <HelpDialog
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        position="left"
        title="レイヤー表示について"
        content={HELP_CONTENT.layerControl}
      />
    </div>
  )
}
