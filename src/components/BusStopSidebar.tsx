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

interface BusStopSidebarProps {
  selectedStops: BusStop[]
  onProceed: () => void
  onReset: () => void
  canProceed: boolean
  onReorder: (newStops: BusStop[]) => void
}

// ドラッグ可能な停留所アイテムコンポーネント
function SortableStopItem({ stop, index }: { stop: BusStop; index: number }) {
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
    transform: transform
      ? `translate3d(0, ${transform.y}px, 0)`
      : undefined,
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors"
    >
      <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
        {index + 1}
      </span>
      <span className="text-sm text-gray-800">{stop.name}</span>
      <span
        {...attributes}
        {...listeners}
        className="ml-auto text-gray-400 text-lg cursor-move hover:text-gray-600 px-2"
      >
        ⋮⋮
      </span>
    </li>
  )
}

export default function BusStopSidebar({
  selectedStops,
  onProceed,
  onReset,
  canProceed,
  onReorder,
}: BusStopSidebarProps) {
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
      onReorder(newStops)
    }
  }
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
                  <SortableStopItem key={stop.id} stop={stop} index={index} />
                ))}
              </ol>
            </SortableContext>
          </DndContext>
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
