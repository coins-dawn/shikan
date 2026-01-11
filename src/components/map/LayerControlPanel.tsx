'use client'

import { useState } from 'react'
import HelpDialog from '@/components/ui/HelpDialog'

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

  const helpContent = [
    '【公共交通を表示】',
    'チェックを入れるとサービスで利用している公共交通（東根市民バス）が表示されます。バス停をクリックすると、各路線ごとの当該バス停の停車時刻が表示されます。表示する内容はGTFSデータリポジトリの「東根市営バス」より取得しています。',
    '【人口メッシュを表示】',
    'チェックを入れるとサービスで利用しているメッシュ単位の人口が表示されます。人口が多いメッシュは暖色、少ないメッシュは寒色で表示されます。表示する内容はe-Statで公開されている2020年国勢調査より取得しています。',
  ]

  return (
    <div className="top-4 left-4 absolute p-3 bg-white rounded-lg shadow-lg z-[50] w-80">
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
        content={helpContent}
      />
    </div>
  )
}
