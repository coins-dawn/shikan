'use client'

import {
  ScreenType,
  ConditionState,
  Spot,
  ReachabilityItem,
  StopSequence,
  BusStop,
  APIResponseWithScore,
  FacilityReachabilityWithScore,
} from '@/types'
import BottomSheet from '@/components/ui/BottomSheet'
import Accordion, { AccordionSection } from '@/components/ui/Accordion'
import { HELP_CONTENT } from '@/lib/constants/helpContent'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { Fragment } from 'react'

interface MobileLayoutProps {
  // 画面状態
  currentScreen: ScreenType

  // 条件設定画面用
  condition: ConditionState
  allSpots: Spot[]
  reachability: ReachabilityItem | null
  spots: Spot[]
  availableDepartureTimes: string[]

  // bus-simple/bus-manual画面用
  allRoutes: StopSequence[]
  selectedRouteIndex: number
  manualBusStops: BusStop[]

  // result画面用
  searchResult: APIResponseWithScore | null

  // イベントハンドラー
  onUpdateCondition: (updates: Partial<ConditionState>) => void
  onNavigateToSimple: () => void
  onNavigateToManual: () => void
  onBackToCondition: () => void
  onBackToBus: () => void
  onExecuteSearch: () => void
  onToggleManualBusStop: (stopId: string) => void
  onUpdateManualBusStops: (stopIds: string[]) => void
  onSelectRoute: (index: number) => void
}

// ドラッグ可能な停留所アイテムコンポーネント
function SortableStopItem({
  stop,
  index,
  onDeselect,
}: {
  stop: BusStop
  index: number
  onDeselect: (stopId: string) => void
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: stop.id })

  const style = {
    transform: transform ? `translate3d(0, ${transform.y}px, 0)` : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 transition-colors min-h-[60px] hover:bg-blue-100"
    >
      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
        {index + 1}
      </span>
      <span
        {...attributes}
        {...listeners}
        className="text-sm text-gray-800 flex-1 cursor-move"
      >
        {stop.name}
      </span>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDeselect(stop.id)
        }}
        className="flex-shrink-0 w-6 h-6 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors flex items-center justify-center"
        aria-label="選択解除"
      >
        ✕
      </button>
    </li>
  )
}

export default function MobileLayout({
  currentScreen,
  condition,
  allSpots,
  reachability,
  spots,
  availableDepartureTimes,
  allRoutes,
  selectedRouteIndex,
  manualBusStops,
  searchResult,
  onUpdateCondition,
  onNavigateToSimple,
  onNavigateToManual,
  onBackToCondition,
  onBackToBus,
  onExecuteSearch,
  onToggleManualBusStop,
  onUpdateManualBusStops,
  onSelectRoute,
}: MobileLayoutProps) {
  // ドラッグ&ドロップセンサー
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = manualBusStops.findIndex((stop) => stop.id === active.id)
      const newIndex = manualBusStops.findIndex((stop) => stop.id === over.id)

      const newStops = arrayMove(manualBusStops, oldIndex, newIndex)
      onUpdateManualBusStops(newStops.map((stop) => stop.id))
    }
  }
  // condition画面のアコーディオンセクション
  const conditionSections: AccordionSection[] = [
    {
      id: 'condition',
      title: '条件設定',
      defaultOpen: true,
      helpContent: HELP_CONTENT.condition,
      content: (
        <div className="space-y-3">
          {/* 対象スポット */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              対象スポット
            </label>
            <select
              value={condition.selectedSpotId}
              onChange={(e) => onUpdateCondition({ selectedSpotId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {allSpots.map((spot) => (
                <option key={spot.id} value={spot.id}>
                  {spot.name}
                </option>
              ))}
            </select>
          </div>

          {/* 移動上限時間 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              移動上限時間
            </label>
            <select
              value={condition.maxMinute}
              onChange={(e) => onUpdateCondition({ maxMinute: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[30, 40, 50, 60].map((time) => (
                <option key={time} value={time}>
                  {time}分
                </option>
              ))}
            </select>
          </div>

          {/* 徒歩上限距離 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              徒歩上限距離
            </label>
            <select
              value={condition.walkingDistance}
              onChange={(e) => onUpdateCondition({ walkingDistance: Number(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {[500, 1000].map((distance) => (
                <option key={distance} value={distance}>
                  {distance}m
                </option>
              ))}
            </select>
          </div>

          {/* 利用時間帯 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              利用時間帯
            </label>
            <select
              value={condition.departureTime}
              onChange={(e) => onUpdateCondition({ departureTime: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {availableDepartureTimes.map((time) => (
                <option key={time} value={time}>
                  {time === '10:00' && '朝（10:00）'}
                  {time === '13:00' && '昼（13:00）'}
                  {time === '16:00' && '夕（16:00）'}
                </option>
              ))}
            </select>
          </div>

          {/* 次へボタン */}
          <button
            onClick={onNavigateToSimple}
            disabled={!condition.selectedSpotId}
            className="w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            次へ
          </button>
        </div>
      ),
    },
    {
      id: 'summary',
      title: 'サマリ',
      defaultOpen: false,
      helpContent: HELP_CONTENT.summary,
      content: (
        <div className="space-y-4">
          {/* 選択条件 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">選択条件</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-medium">対象スポット:</span>{' '}
                {allSpots.find((s) => s.id === condition.selectedSpotId)?.name || '-'}
              </div>
              <div>
                <span className="font-medium">移動上限時間:</span> {condition.maxMinute}分
              </div>
              <div>
                <span className="font-medium">徒歩上限距離:</span> {condition.walkingDistance}m
              </div>
              <div>
                <span className="font-medium">利用時間帯:</span>{' '}
                {condition.departureTime === '10:00' && '朝（10:00）'}
                {condition.departureTime === '13:00' && '昼（13:00）'}
                {condition.departureTime === '16:00' && '夕（16:00）'}
              </div>
            </div>
          </div>

          {/* 到達可能人口 */}
          {reachability && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                到達可能人口
              </h3>
              <div className="text-2xl font-bold text-blue-600">
                {reachability.score.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-1">人</span>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  // bus-simple画面のアコーディオンセクション
  const busSimpleSections: AccordionSection[] = [
    {
      id: 'bus-condition',
      title: 'バス条件設定',
      defaultOpen: true,
      helpContent: HELP_CONTENT.busSimple,
      content: (
        <div className="space-y-4">
          {/* ルート選択 */}
          {allRoutes.length > 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ルートを選択
              </label>
              <select
                value={selectedRouteIndex}
                onChange={(e) => onSelectRoute(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {allRoutes.map((route, index) => (
                  <option key={index} value={index}>
                    ルート{index + 1}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* 手動設定するリンク */}
          <button
            onClick={onNavigateToManual}
            className="w-full text-sm text-blue-600 hover:text-blue-700 underline text-center"
          >
            手動設定する
          </button>

          {/* 次へボタン */}
          <button
            onClick={onExecuteSearch}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            次へ
          </button>

          {/* 戻るボタン */}
          <button
            onClick={onBackToCondition}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            戻る
          </button>
        </div>
      ),
    },
    {
      id: 'summary',
      title: 'サマリ',
      defaultOpen: false,
      helpContent: HELP_CONTENT.summary,
      content: (
        <div className="space-y-4">
          {/* 選択条件 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">選択条件</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-medium">対象スポット:</span>{' '}
                {allSpots.find((s) => s.id === condition.selectedSpotId)?.name || '-'}
              </div>
              <div>
                <span className="font-medium">移動上限時間:</span> {condition.maxMinute}分
              </div>
              <div>
                <span className="font-medium">徒歩上限距離:</span> {condition.walkingDistance}m
              </div>
            </div>
          </div>

          {/* 到達可能人口 */}
          {reachability && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                到達可能人口
              </h3>
              <div className="text-2xl font-bold text-blue-600">
                {reachability.score.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-1">人</span>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  // bus-manual画面のアコーディオンセクション
  const busManualSections: AccordionSection[] = [
    {
      id: 'bus-manual',
      title: 'バス停選択',
      defaultOpen: true,
      helpContent: HELP_CONTENT.busManual,
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-700">
            地図上のバス停マーカーをタップしてルートに追加してください。
            追加したバス停はドラッグ&ドロップで並び替えできます。
          </p>

          {/* 選択済みバス停リスト */}
          {manualBusStops.length > 0 ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={manualBusStops.map((stop) => stop.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-2">
                  {manualBusStops.map((stop, index) => (
                    <SortableStopItem
                      key={stop.id}
                      stop={stop}
                      index={index}
                      onDeselect={onToggleManualBusStop}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          ) : (
            <div className="text-center text-gray-500 py-8">
              バス停が選択されていません
            </div>
          )}

          {/* 次へボタン */}
          <button
            onClick={onExecuteSearch}
            disabled={manualBusStops.length < 2}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            次へ（{manualBusStops.length}/2以上）
          </button>

          {/* 戻るボタン */}
          <button
            onClick={onNavigateToSimple}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            簡易設定に戻る
          </button>
        </div>
      ),
    },
    {
      id: 'summary',
      title: 'サマリ',
      defaultOpen: false,
      helpContent: HELP_CONTENT.summary,
      content: (
        <div className="space-y-4">
          {/* 選択条件 */}
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-2">選択条件</h3>
            <div className="space-y-1 text-sm text-gray-700">
              <div>
                <span className="font-medium">対象スポット:</span>{' '}
                {allSpots.find((s) => s.id === condition.selectedSpotId)?.name || '-'}
              </div>
              <div>
                <span className="font-medium">移動上限時間:</span> {condition.maxMinute}分
              </div>
              <div>
                <span className="font-medium">徒歩上限距離:</span> {condition.walkingDistance}m
              </div>
            </div>
          </div>

          {/* 到達可能人口 */}
          {reachability && (
            <div>
              <h3 className="text-sm font-semibold text-gray-800 mb-2">
                到達可能人口
              </h3>
              <div className="text-2xl font-bold text-blue-600">
                {reachability.score.toLocaleString()}
                <span className="text-sm font-normal text-gray-600 ml-1">人</span>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  // result画面のデータ
  const combusData = searchResult?.result.combus ?? null
  const facilityResult = searchResult?.result.area ?? null
  const originalScore = facilityResult?.reachable['original-score'] ?? 0
  const increase = facilityResult?.reachable['with-combus-score'] ?? 0
  const increaseRate = facilityResult?.reachable['with-combus-score-rate'] ?? 0
  const totalAfterCombus = originalScore + increase

  // result画面のアコーディオンセクション（簡易版）
  const resultSections: AccordionSection[] = [
    {
      id: 'combus-detail',
      title: 'コミバス詳細',
      defaultOpen: true,
      helpContent: HELP_CONTENT.busStopDetail,
      content: combusData ? (
        <div className="space-y-3">
          {/* バス停一覧 */}
          <div>
            <div className="text-sm text-gray-600 mb-2">バス停一覧（{combusData['stop-list'].length}ヶ所）</div>
            <ul className="space-y-1">
              {combusData['stop-list'].map((stop, index) => (
                <li key={stop.id} className="text-sm text-gray-700">
                  {index + 1}. {stop.name}
                </li>
              ))}
            </ul>
          </div>

          {/* 区間情報 */}
          <div>
            <div className="text-sm text-gray-600 mb-2">区間数</div>
            <div className="text-xl font-bold text-blue-600">
              {combusData['section-list'].length}区間
            </div>
          </div>

          {/* 戻るボタン */}
          <button
            onClick={onBackToBus}
            className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            バス条件設定に戻る
          </button>
        </div>
      ) : (
        <div className="text-gray-500">データがありません</div>
      ),
    },
    {
      id: 'sample-route',
      title: 'サンプル経路',
      defaultOpen: false,
      helpContent: HELP_CONTENT.busStopDetail,
      content: (
        <div className="text-sm text-gray-700 space-y-2">
          <p>サンプル経路の表示はデスクトップ版をご利用ください。</p>
        </div>
      ),
    },
    {
      id: 'result-summary',
      title: '結果サマリ',
      defaultOpen: false,
      helpContent: HELP_CONTENT.resultSummary,
      content: (
        <div className="space-y-4">
          {/* 導入前の到達可能人口 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">導入前の到達可能人口</div>
            <div className="text-lg font-bold text-gray-700">
              {originalScore.toLocaleString()}人
            </div>
          </div>

          {/* 導入後の到達可能人口 */}
          <div>
            <div className="text-sm text-gray-600 mb-1">導入後の到達可能人口</div>
            <div className="text-2xl font-bold text-blue-600">
              {totalAfterCombus.toLocaleString()}人
            </div>
          </div>

          {/* 増加量 */}
          {facilityResult && (
            <div className={increaseRate === 0 ? "bg-gray-100 rounded-lg p-3" : "bg-green-50 rounded-lg p-3"}>
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1">
                  <div className="text-sm text-gray-600 mb-1">人口増加</div>
                  <div className="text-xl font-bold text-green-600">
                    +{increase.toLocaleString()}人
                  </div>
                  <div className="text-sm text-gray-600">
                    ({increaseRate.toFixed(1)}%増)
                  </div>
                </div>
                <div className="text-3xl">
                  {increaseRate > 0 ? '😊' : '😐'}
                </div>
              </div>
            </div>
          )}
        </div>
      ),
    },
  ]

  // 現在の画面に応じたコンテンツを返す
  const renderContent = () => {
    switch (currentScreen) {
      case 'condition':
        return <Accordion sections={conditionSections} />

      case 'bus-simple':
        return <Accordion sections={busSimpleSections} />

      case 'bus-manual':
        return <Accordion sections={busManualSections} />

      case 'result':
        return <Accordion sections={resultSections} />

      default:
        return null
    }
  }

  return (
    <BottomSheet defaultHeight="half" showDragHandle>
      {renderContent()}
    </BottomSheet>
  )
}
