'use client'

import { GeoJSON } from 'react-leaflet'
import { ReachabilityGeoJSON } from '@/types'

interface ReachabilityLayerProps {
  data: ReachabilityGeoJSON | null
  color?: string
  fillOpacity?: number
}

export default function ReachabilityLayer({
  data,
  color = '#3b82f6',
  fillOpacity = 0.3,
}: ReachabilityLayerProps) {
  if (!data) return null

  return (
    <GeoJSON
      data={data}
      style={{
        color: color,
        weight: 2,
        fillOpacity: fillOpacity,
      }}
    />
  )
}
