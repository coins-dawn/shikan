'use client'

import { useState } from 'react'
import HelpDialog from '@/components/ui/HelpDialog'
import { HELP_CONTENT } from '@/lib/constants/helpContent'
import { useMediaQuery } from '@/hooks/useMediaQuery'

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
  const isDesktop = useMediaQuery('(min-width: 790px)')
  return (
    <div className={`${isDesktop ? 'top-4 left-4 rounded-lg p-3 max-w-90 shadow-lg' : 'top-0 left-0 px-3 py-2'} absolute bg-white z-[60] w-[calc(100%)]`}>
      <div className="flex flex-row items-center gap-2 justify-between">
        <div className="flex flex-row gap-4">
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPublicTransit}
              onChange={onTogglePublicTransit}
              className="cursor-pointer"
            />
            <span className="text-sm text-gray-700">{isDesktop ? "公共交通を表示" : "公共交通"}</span>
          </label>
          <label className="flex items-center gap-1 cursor-pointer">
            <input
              type="checkbox"
              checked={showPopulationMesh}
              onChange={onTogglePopulationMesh}
              className="cursor-pointer"
            />
            <span className="text-sm text-gray-700">{isDesktop ? "人口メッシュを表示" : "人口"}</span>
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
