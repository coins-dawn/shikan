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
    <div className="absolute top-0 left-0 px-3 py-2 desktop:top-4 desktop:left-4 desktop:rounded-lg desktop:p-3 desktop:max-w-90 desktop:shadow-lg bg-white z-[60] w-[calc(100%)]">
      <div className="flex flex-row items-center gap-2 justify-between">
        <div className="flex flex-row gap-4">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPublicTransit}
              onChange={onTogglePublicTransit}
              className="cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              <span className="desktop:hidden">公共交通</span>
              <span className="hidden desktop:inline">公共交通を表示</span>
            </span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPopulationMesh}
              onChange={onTogglePopulationMesh}
              className="cursor-pointer"
            />
            <span className="text-sm text-gray-700">
              <span className="desktop:hidden">人口</span>
              <span className="hidden desktop:inline">人口メッシュを表示</span>
            </span>
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
