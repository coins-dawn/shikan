'use client'

import { APIResponse } from '@/types'
import { countReachableSpots, calculateMultiPolygonArea } from '@/lib/utils/geoCalculations'
import { useMemo } from 'react'

interface KPIDashboardProps {
  apiResponse: APIResponse | null
}

export default function KPIDashboard({ apiResponse }: KPIDashboardProps) {
  if (!apiResponse) return null

  const { area, combus } = apiResponse.result

  // 施設アクセス改善の集計
  const facilityStats = useMemo(() => {
    return Object.entries(area).map(([facilityType, data]) => {
      if (!data || !data.spots || !data.reachable) {
        return {
          type: facilityType,
          original: 0,
          withCombus: 0,
          increase: 0,
        }
      }

      const originalReachable = countReachableSpots(
        data.spots,
        data.reachable.original
      )
      const withCombus = countReachableSpots(
        data.spots,
        data.reachable['with-combus']
      )

      return {
        type: facilityType,
        original: originalReachable,
        withCombus,
        increase: withCombus - originalReachable,
      }
    })
  }, [area])

  // 到達圏面積の集計
  const areaStats = useMemo(() => {
    // 全施設種別の到達圏を統合して計算（重複を考慮しない簡易版）
    let originalArea = 0
    let withCombusArea = 0

    Object.values(area).forEach((data) => {
      if (!data || !data.reachable) return

      originalArea += calculateMultiPolygonArea(data.reachable.original)
      withCombusArea += calculateMultiPolygonArea(data.reachable['with-combus'])
    })

    return {
      original: originalArea,
      withCombus: withCombusArea,
      increase: withCombusArea - originalArea,
      increaseRate:
        originalArea > 0
          ? ((withCombusArea - originalArea) / originalArea) * 100
          : 0,
    }
  }, [area])

  // バス路線情報の集計
  const totalStops = combus['stop-list'].length
  const totalDistance = combus['section-list'].reduce(
    (sum, section) => sum + section['distance-km'],
    0
  )
  const totalDuration = combus['section-list'].reduce(
    (sum, section) => sum + section['duration-m'],
    0
  )

  // 施設種別の表示名とアイコンのマッピング
  const facilityLabels: Record<string, { label: string; icon: string }> = {
    hospital: { label: '病院', icon: '🏥' },
    shopping: { label: '商業施設', icon: '🛒' },
    'public-facility': { label: '公共施設', icon: '🏛️' },
    school: { label: '学校', icon: '🏫' },
    park: { label: '公園', icon: '🌳' },
  }

  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white rounded-lg shadow-lg p-4 w-80 max-h-[calc(100vh-2rem)] overflow-y-auto">
      <h2 className="text-lg font-bold mb-4 pb-2 border-b">
        コミュニティバス導入効果分析
      </h2>

      {/* 施設アクセス改善 */}
      <section className="mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
          🎯 施設アクセス改善
        </h3>
        <div className="space-y-2">
          {facilityStats.map((stat) => {
            const facilityInfo = facilityLabels[stat.type] || {
              label: stat.type,
              icon: '📍',
            }
            return (
              <div key={stat.type} className="text-sm">
                <div className="flex items-center gap-1 font-medium">
                  <span>{facilityInfo.icon}</span>
                  <span>{facilityInfo.label}</span>
                </div>
                <div className="ml-5 text-gray-600">
                  既存 {stat.original}箇所 → {stat.withCombus}箇所
                  {stat.increase > 0 && (
                    <span className="text-green-600 font-semibold">
                      {' '}
                      (+{stat.increase})
                    </span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* バス路線情報 */}
      <section className="mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
          🚌 路線情報
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">停留所:</span>
            <span className="font-medium">{totalStops}箇所</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">総距離:</span>
            <span className="font-medium">{totalDistance.toFixed(1)}km</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">所要時間:</span>
            <span className="font-medium">約{totalDuration}分</span>
          </div>
        </div>
      </section>

      {/* 到達圏面積 */}
      <section className="mb-4">
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
          🗺️ 到達圏拡大
        </h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">既存:</span>
            <span className="font-medium">{areaStats.original.toFixed(2)}km²</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">追加:</span>
            <span className="font-medium text-green-600">
              +{areaStats.increase.toFixed(2)}km²
            </span>
          </div>
          {areaStats.increaseRate > 0 && (
            <div className="text-right text-xs text-green-600 font-semibold">
              ({areaStats.increaseRate.toFixed(1)}%増)
            </div>
          )}
        </div>
      </section>

      {/* 人口カバー（今後実装） */}
      <section>
        <h3 className="text-sm font-semibold mb-2 flex items-center gap-1">
          📊 人口カバー
        </h3>
        <div className="text-sm text-gray-500">
          計算中...
        </div>
      </section>
    </div>
  )
}
