interface LayerControlPanelProps {
  showReachability1: boolean
  showReachability2: boolean
  showPopulation: boolean
  onToggleReachability1: () => void
  onToggleReachability2: () => void
  onTogglePopulation: () => void
}

export default function LayerControlPanel({
  showReachability1,
  showReachability2,
  showPopulation,
  onToggleReachability1,
  onToggleReachability2,
  onTogglePopulation,
}: LayerControlPanelProps) {
  return (
    <div className="bg-white shadow-md px-6 py-4 border-b border-gray-200">
      <div className="flex gap-6 items-center">
        <h2 className="font-semibold text-gray-700">レイヤー表示</h2>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showReachability1}
            onChange={onToggleReachability1}
            className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700">到達圏1（現状）</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showReachability2}
            onChange={onToggleReachability2}
            className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
          />
          <span className="text-sm text-gray-700">到達圏2（コミュニティバス後）</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showPopulation}
            onChange={onTogglePopulation}
            className="w-4 h-4 text-orange-600 rounded focus:ring-2 focus:ring-orange-500"
          />
          <span className="text-sm text-gray-700">人口分布</span>
        </label>
      </div>
    </div>
  )
}
