interface BusStop {
  id: string
  name: string
}

interface BusStopSidebarProps {
  selectedStops: BusStop[]
  onProceed: () => void
  onReset: () => void
  canProceed: boolean
}

export default function BusStopSidebar({
  selectedStops,
  onProceed,
  onReset,
  canProceed,
}: BusStopSidebarProps) {
  return (
    <div className="bg-white shadow-lg w-80 h-full flex flex-col border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">停留所選択</h2>
        <p className="text-sm text-gray-600 mt-1">
          コミュニティバスの停留所を選択してください（最低2箇所）
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {selectedStops.length === 0 ? (
          <p className="text-sm text-gray-500 text-center mt-8">
            地図上のマーカーをクリックして停留所を選択
          </p>
        ) : (
          <ol className="space-y-2">
            {selectedStops.map((stop, index) => (
              <li
                key={stop.id}
                className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200"
              >
                <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm text-gray-800">{stop.name}</span>
              </li>
            ))}
          </ol>
        )}
      </div>

      <div className="p-4 border-t border-gray-200 space-y-2">
        <button
          onClick={onProceed}
          disabled={!canProceed}
          className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          進む
        </button>
        <button
          onClick={onReset}
          className="w-full py-2 px-4 rounded-lg font-medium bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
        >
          戻る
        </button>
      </div>
    </div>
  )
}
