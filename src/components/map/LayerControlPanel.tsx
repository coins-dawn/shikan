import { FacilityType } from '@/types'

interface LayerControlPanelProps {
  showReachability1: Record<string, boolean>
  showReachability2: Record<string, boolean>
  showPopulation: boolean
  availableFacilities: FacilityType[]
  onToggleReachability1: (facility: FacilityType) => void
  onToggleReachability2: (facility: FacilityType) => void
  onTogglePopulation: () => void
  spotLabels: Record<string, string>
}

export default function LayerControlPanel({
  showReachability1,
  showReachability2,
  showPopulation,
  availableFacilities,
  onToggleReachability1,
  onToggleReachability2,
  onTogglePopulation,
  spotLabels,
}: LayerControlPanelProps) {
  return (
    <div className="bg-white shadow-md px-6 py-4 border-b border-gray-200">
      <div className="flex gap-8 items-center flex-wrap">
        <h2 className="font-semibold text-gray-700">レイヤー表示</h2>

        {availableFacilities && availableFacilities.length > 0 && (
          <>
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-600">到達圏1（現状）:</span>
              {availableFacilities.map((facility) => (
                <label key={facility} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showReachability1[facility]}
                    onChange={() => onToggleReachability1(facility)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{spotLabels[facility] || facility}</span>
                </label>
              ))}
            </div>

            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-600">到達圏2（コミュニティバス後）:</span>
              {availableFacilities.map((facility) => (
                <label key={facility} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showReachability2[facility]}
                    onChange={() => onToggleReachability2(facility)}
                    className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-700">{spotLabels[facility] || facility}</span>
                </label>
              ))}
            </div>
          </>
        )}

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
