import { FacilityType } from '@/types'

interface SearchPanelProps {
  selectedFacilities: FacilityType[]
  maxMinute: number
  onToggleFacility: (facility: FacilityType) => void
  onMaxMinuteChange: (value: number) => void
}

const FACILITY_LABELS: Record<FacilityType, string> = {
  hospital: '病院',
  shopping: '商業施設',
}

export default function SearchPanel({
  selectedFacilities,
  maxMinute,
  onToggleFacility,
  onMaxMinuteChange,
}: SearchPanelProps) {
  return (
    <div className="bg-white shadow-md px-6 py-4 border-b border-gray-200">
      <div className="flex gap-8 items-center">
        <h2 className="font-semibold text-gray-700">検索条件</h2>

        <div className="flex gap-4 items-center">
          <span className="text-sm text-gray-600">施設タイプ:</span>
          {(Object.keys(FACILITY_LABELS) as FacilityType[]).map((facility) => (
            <label key={facility} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedFacilities.includes(facility)}
                onChange={() => onToggleFacility(facility)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{FACILITY_LABELS[facility]}</span>
            </label>
          ))}
        </div>

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
  )
}
