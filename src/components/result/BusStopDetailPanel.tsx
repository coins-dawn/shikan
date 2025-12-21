'use client'

import { useState } from 'react'
import { CombusData } from '@/types'
import Panel from '@/components/ui/Panel'

interface BusStopDetailPanelProps {
  combusData: CombusData | null
  onShowSampleRoute: () => void
}

export default function BusStopDetailPanel({
  combusData,
  onShowSampleRoute,
}: BusStopDetailPanelProps) {
  if (!combusData) {
    return (
      <Panel position="left" title="バス停詳細">
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

  return (
    <Panel position="left" title="バス停詳細">
      <div className="flex flex-col h-full space-y-4">
        {/* 周回サマリ */}
        <div className="bg-blue-50 rounded-lg p-3 flex-shrink-0">
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
        <div className="flex-1 min-h-0 flex flex-col">
          <h3 className="text-sm font-medium text-gray-700 mb-2 flex-shrink-0">バス停一覧</h3>
          <div className="space-y-2 overflow-y-auto flex-1">
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
                    {stopList.length + 1}
                  </span>
                  <span className="flex-1 truncate">{stopList[0].name}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* サンプル経路一覧 */}
        <div className="flex-shrink-0">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            サンプル経路
          </h3>
          <div className="space-y-2">
            <button
              onClick={onShowSampleRoute}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left"
            >
              サンプル経路 1
            </button>
            <button
              onClick={onShowSampleRoute}
              className="w-full px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left"
            >
              サンプル経路 2
            </button>
          </div>
        </div>
      </div>
    </Panel>
  )
}
