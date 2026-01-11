'use client'

import Panel from '@/components/ui/Panel'
import { CombusData, RoutePair, RouteInfo, ScreenType } from '@/types'

interface BusStopDetailPanelProps {
  combusData: CombusData | null
  routePairs: RoutePair[]
  selectedRouteIndex: number | null
  onShowSampleRoute: (index: number) => void
  onCloseSampleRoute: () => void
  onBack: () => void
  currentScreen?: ScreenType
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
      className={`flex-1 rounded-lg p-3 ${isCombus ? 'bg-green-50' : 'bg-gray-50'
        }`}
    >
      {/* タイトル */}
      <h3
        className={`text-sm font-medium mb-3 ${isCombus ? 'text-green-800' : 'text-gray-800'
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
              className={`text-base font-bold ${isCombus ? 'text-green-600' : 'text-gray-700'
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
              className={`text-base font-bold ${isCombus ? 'text-green-600' : 'text-gray-700'
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
                  className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${section.mode === 'combus'
                    ? 'bg-blue-100 text-blue-700'
                    : section.mode === 'bus'
                      ? 'bg-gray-100 text-gray-700'
                      : section.mode === 'tram'
                        ? 'bg-gray-100 text-gray-700'
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

export default function BusStopDetailPanel({
  combusData,
  routePairs,
  selectedRouteIndex,
  onShowSampleRoute,
  onCloseSampleRoute,
  onBack,
  currentScreen,
}: BusStopDetailPanelProps) {
  const helpContent = [
    '緑色のメッシュがコミュニティバスの導入によって新たに到達可能になった地域です',
    'サンプル経路ボタンを押すとコミュニティバスの導入によって改善された一例が見ることができます',
  ]

  if (!combusData) {
    return (
      <Panel
        position="left"
        title="バス停詳細"
        helpContent={helpContent}
        currentScreen={currentScreen}
      >
        <div className="text-gray-500">データがありません</div>
      </Panel>
    )
  }

  const stopList = combusData['stop-list']
  const sectionList = combusData['section-list']

  // 周回所要時間（分）の合計
  const totalDuration = sectionList.reduce(
    (sum, section) => sum + section['duration-m'],
    0
  )

  // 周回経路長（km）の合計
  const totalDistance = sectionList.reduce(
    (sum, section) => sum + section['distance-km'],
    0
  )

  // 選択されたサンプル経路
  const selectedRoutePair =
    selectedRouteIndex !== null ? routePairs[selectedRouteIndex] : null

  // 改善点の判定
  const durationImproved = selectedRoutePair
    ? selectedRoutePair['with-combus']['duration-m'] <
    selectedRoutePair.original['duration-m']
    : false
  const walkDistanceImproved = selectedRoutePair
    ? selectedRoutePair['with-combus']['walk-distance-m'] <
    selectedRoutePair.original['walk-distance-m']
    : false

  const isSampleRouteOpen = selectedRouteIndex !== null

  return (
    <Panel
      position="left"
      title="シミュレーション結果"
      helpContent={helpContent}
      currentScreen={currentScreen}
    >

      {/* 折りたたみ可能なコンテンツ（バス停詳細） */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isSampleRouteOpen ? 'max-h-0' : 'max-h-[calc(100vh-20rem)]'
          }`}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          コミュニティバス詳細
        </h3>
        <div className="flex flex-col space-y-4 mb-4">
          {/* 周回サマリ */}
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="text-gray-600">周回所要時間</span>
                <div className="font-bold text-blue-600">{totalDuration}分</div>
              </div>
              <div>
                <span className="text-gray-600">周回経路長</span>
                <div className="font-bold text-blue-600">
                  {totalDistance.toFixed(1)}km
                </div>
              </div>
            </div>
          </div>

          {/* バス停一覧 */}
          <div className="flex flex-col max-h-[calc(100vh-414px)] overflow-hidden">
            <div className="space-y-2 overflow-y-auto">
              {stopList.map((stop, index) => (
                <div key={stop.id} className="text-sm">
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium mr-2">
                      {index + 1}
                    </span>
                    <span className="flex-1 truncate">{stop.name}</span>
                  </div>
                  {sectionList[index] && (
                    <div className="text-gray-500 text-xs ml-8 mt-1">
                      ↓ {sectionList[index]['duration-m']}分
                    </div>
                  )}
                </div>
              ))}
              {/* 循環バスなので最初のバス停に戻る */}
              {stopList.length > 0 && sectionList.length === stopList.length && (
                <div className="text-sm">
                  <div className="flex items-center">
                    <span className="w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-xs font-medium mr-2">
                      {1}
                    </span>
                    <span className="flex-1 truncate">{stopList[0].name}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* サンプル経路ボタン（常に表示） */}
      <div className="">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          サンプル経路
        </h3>
        {routePairs.length > 0 ? (
          <div className="space-y-2">
            {routePairs.map((_, index) => {
              const isSelected = selectedRouteIndex === index
              return (
                <button
                  key={index}
                  onClick={() =>
                    isSelected ? onCloseSampleRoute() : onShowSampleRoute(index)
                  }
                  className={`w-full px-3 py-2 text-sm rounded-md transition-colors flex items-center justify-between ${isSelected
                    ? 'bg-blue-500 text-white font-medium'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                >
                  <span>サンプル経路 {index + 1}</span>
                  {isSelected && (
                    <span className="text-xs">×</span>
                  )}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="text-sm text-gray-500">
            サンプル経路データがありません
          </div>
        )}
      </div>

      {/* コミュニティバスの条件設定に戻るボタン */}
      {!isSampleRouteOpen && <button
        onClick={onBack}
        className="mt-4 w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2 transition-colors"
      >
        戻る
      </button>}

      {/* サンプル経路の詳細（展開時） */}
      <div
        className={`transition-all duration-300 ease-in-out overflow-hidden ${isSampleRouteOpen ? 'max-h-[calc(100vh-20rem)]' : 'max-h-0'
          }`}
      >
        {selectedRoutePair && selectedRouteIndex !== null && (
          <div className="">
            <div className="pt-4">
              <div className="flex gap-3 overflow-y-auto max-h-[calc(100vh-24rem)]">
                <RouteDisplay
                  route={selectedRoutePair.original}
                  title="導入前"
                  isCombus={false}
                />
                <RouteDisplay
                  route={selectedRoutePair['with-combus']}
                  title="導入後"
                  isCombus={true}
                  comparison={{ durationImproved, walkDistanceImproved }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </Panel>
  )
}
