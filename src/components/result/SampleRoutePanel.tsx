'use client'

import { RoutePair, RouteInfo } from '@/types'

interface SampleRoutePanelProps {
  isOpen: boolean
  onClose: () => void
  routePair: RoutePair | null
  routeIndex: number | null
}

// 経路情報表示用コンポーネント
function RouteDisplay({
  route,
  title,
  isCombus,
  comparison,
}: {
  route: RouteInfo
  title: string
  isCombus: boolean
  comparison?: {
    durationImproved: boolean
    walkDistanceImproved: boolean
  }
}) {
  return (
    <div
      className={`flex-1 rounded-lg p-3 ${
        isCombus ? 'bg-green-50' : 'bg-gray-50'
      }`}
    >
      {/* タイトル */}
      <h3
        className={`text-sm font-medium mb-3 ${
          isCombus ? 'text-green-800' : 'text-gray-800'
        }`}
      >
        {title}
      </h3>

      {/* 主要指標 */}
      <div className="space-y-2 mb-3">
        {/* 所要時間 */}
        <div className="bg-white border border-gray-200 rounded p-2">
          <div className="text-xs text-gray-600">所要時間</div>
          <div className="flex items-center gap-2">
            <span
              className={`text-base font-bold ${
                isCombus ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              {route['duration-m']}分
            </span>
            {comparison?.durationImproved && (
              <span className="text-green-600 text-sm">✓</span>
            )}
          </div>
        </div>

        {/* 徒歩距離 */}
        <div className="bg-white border border-gray-200 rounded p-2">
          <div className="text-xs text-gray-600">徒歩距離</div>
          <div className="flex items-center gap-2">
            <span
              className={`text-base font-bold ${
                isCombus ? 'text-green-600' : 'text-gray-700'
              }`}
            >
              {(route['walk-distance-m'] / 1000).toFixed(1)}km
            </span>
            {comparison?.walkDistanceImproved && (
              <span className="text-green-600 text-sm">✓</span>
            )}
          </div>
        </div>
      </div>

      {/* ルート詳細 */}
      <div>
        <h4 className="text-xs font-medium text-gray-700 mb-2">ルート詳細</h4>
        <div className="space-y-1.5">
          {route.sections.map((section, idx) => (
            <div key={idx} className="bg-white rounded p-2 text-xs">
              {/* 交通手段バッジ */}
              <div className="flex items-center gap-1.5 mb-1">
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                    section.mode === 'combus'
                      ? 'bg-green-100 text-green-700'
                      : section.mode === 'bus'
                      ? 'bg-blue-100 text-blue-700'
                      : section.mode === 'tram'
                      ? 'bg-purple-100 text-purple-700'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {section.mode === 'combus'
                    ? 'コミバス'
                    : section.mode === 'bus'
                    ? 'バス'
                    : section.mode === 'tram'
                    ? '電車'
                    : '徒歩'}
                </span>
                <span className="text-gray-600">{section['duration-m']}分</span>
              </div>

              {/* 経路 */}
              <div className="text-gray-600 text-[11px]">
                <div className="truncate">{section.from.name}</div>
                <div className="text-gray-400">↓</div>
                <div className="truncate">{section.to.name}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function SampleRoutePanel({
  isOpen,
  onClose,
  routePair,
  routeIndex,
}: SampleRoutePanelProps) {
  if (!isOpen || !routePair || routeIndex === null) return null

  const original = routePair.original
  const withCombus = routePair['with-combus']

  // 改善点の判定
  const durationImproved =
    withCombus['duration-m'] < original['duration-m']
  const walkDistanceImproved =
    withCombus['walk-distance-m'] < original['walk-distance-m']

  return (
    <div
      className="absolute top-4 left-4 z-[999] bg-white rounded-lg shadow-lg w-80 overflow-hidden flex flex-col transition-all duration-300 ease-in-out"
      style={{
        transform: isOpen ? 'translateY(0)' : 'translateY(-20px)',
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'auto' : 'none',
        marginTop: '240px' // バス停詳細パネルの折りたたみ時の高さ分下げる
      }}
    >
      {/* ヘッダー */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
        <h2 className="font-medium text-gray-800">
          サンプル経路 {routeIndex + 1}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>

      {/* コンテンツ */}
      <div className="p-4 overflow-y-auto max-h-[calc(100vh-23rem)]">
        {/* 2カラム比較表示 */}
        <div className="flex gap-3">
          <RouteDisplay route={original} title="導入前" isCombus={false} />
          <RouteDisplay
            route={withCombus}
            title="導入後"
            isCombus={true}
            comparison={{ durationImproved, walkDistanceImproved }}
          />
        </div>
      </div>
    </div>
  )
}
