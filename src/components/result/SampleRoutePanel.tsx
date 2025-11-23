'use client'

interface SampleRoutePanelProps {
  isOpen: boolean
  onClose: () => void
}

export default function SampleRoutePanel({
  isOpen,
  onClose,
}: SampleRoutePanelProps) {
  if (!isOpen) return null

  return (
    <div className="absolute top-4 left-[340px] z-[1000] bg-white rounded-lg shadow-lg w-80 max-h-[calc(100vh-8rem)] overflow-hidden flex flex-col">
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="font-medium text-gray-800">サンプル経路</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* コンテンツ */}
      <div className="p-4 overflow-y-auto flex-1">
        <div className="text-gray-500 text-sm">
          <p>このパネルはサンプル経路APIの開発後に実装されます。</p>
          <p className="mt-2">
            サンプル経路の詳細情報がここに表示される予定です。
          </p>
        </div>
      </div>
    </div>
  )
}
