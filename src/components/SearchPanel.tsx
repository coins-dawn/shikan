import { FacilityType } from '@/types'

interface SearchPanelProps {
  selectedFacilities: FacilityType[]
  maxMinute: number
  onToggleFacility: (facility: FacilityType) => void
  onMaxMinuteChange: (value: number) => void
  availableSpotTypes: string[]
  spotLabels: Record<string, string>
  selectedSpotTypes: string[]
  onToggleSpotType: (type: string) => void
}

export default function SearchPanel({
  selectedFacilities,
  maxMinute,
  onToggleFacility,
  onMaxMinuteChange,
  availableSpotTypes,
  spotLabels,
  selectedSpotTypes,
  onToggleSpotType,
}: SearchPanelProps) {
  return (
    <div className="bg-white shadow-md px-6 py-4 border-b border-gray-200">
      <div className="flex flex-col gap-4">
        <div className="flex gap-8 items-center">
          <h2 className="font-semibold text-gray-700">検索条件</h2>

          {availableSpotTypes && availableSpotTypes.length > 0 && (
            <div className="flex gap-4 items-center">
              <span className="text-sm text-gray-600">施設タイプ:</span>
              {availableSpotTypes.map((type) => {
                // スポット表示の状態を優先（マーカー表示制御）
                const isChecked = selectedSpotTypes?.includes(type) ?? false

                const handleToggle = () => {
                  // 両方の状態を同期して切り替え
                  onToggleFacility(type as FacilityType)
                  onToggleSpotType(type)
                }

                return (
                  <label key={type} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={handleToggle}
                      className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700">
                      {spotLabels?.[type] || type}
                    </span>
                  </label>
                )
              })}
            </div>
          )}

          <div className="flex items-center gap-2">
            <label htmlFor="max-minute" className="text-sm text-gray-600">
              最大到達時間:
            </label>
            <input
              id="max-minute"
              type="number"
              value={maxMinute}
              onChange={(e) => onMaxMinuteChange(Number(e.target.value))}
              min="1"
              max="120"
              className="w-20 px-2 py-1 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <span className="text-sm text-gray-600">分</span>
          </div>
        </div>
      </div>
    </div>
  )
}
