'use client'

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
import { BusStop } from '@/types'
import Panel from '@/components/ui/Panel'

interface BusManualPanelProps {
  selectedStops: BusStop[]
  onReorder: (newStopIds: string[]) => void
  onDeselect: (stopId: string) => void
  onNext: () => void
  onBackToSimple: () => void
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

  // 縦方向のみの移動に制限
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

export default function BusManualPanel({
  selectedStops,
  onReorder,
  onDeselect,
  onNext,
  onBackToSimple,
}: BusManualPanelProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = selectedStops.findIndex((stop) => stop.id === active.id)
      const newIndex = selectedStops.findIndex((stop) => stop.id === over.id)

      const newStops = arrayMove(selectedStops, oldIndex, newIndex)
      onReorder(newStops.map((stop) => stop.id))
    }
  }

  const canProceed = selectedStops.length >= 2

  return (
    <Panel position="left" title="コミュニティバスの条件設定（手動）">
      <div className="space-y-4">
        {/* 説明文 */}
        <p className="text-sm text-gray-600">
          地図上のマーカーをクリックしてバス停を選択してください（最低2箇所）
        </p>

        {/* バス停一覧 */}
        <div>
          {selectedStops.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">
              地図上のマーカーをクリックしてバス停を選択
            </p>
          ) : (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={selectedStops.map((stop) => stop.id)}
                strategy={verticalListSortingStrategy}
              >
                <ol className="space-y-2">
                  {selectedStops.map((stop, index) => (
                    <SortableStopItem
                      key={stop.id}
                      stop={stop}
                      index={index}
                      onDeselect={onDeselect}
                    />
                  ))}
                </ol>
              </SortableContext>
            </DndContext>
          )}
        </div>

        {/* 簡易選択に戻るリンク */}
        <button
          onClick={onBackToSimple}
          className="w-full text-sm text-blue-600 hover:text-blue-700 underline text-center"
        >
          簡易選択に戻る
        </button>

        {/* 次へボタン */}
        <button
          onClick={onNext}
          disabled={!canProceed}
          className={`w-full px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors ${
            canProceed
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          次へ
        </button>
      </div>
    </Panel>
  )
}
