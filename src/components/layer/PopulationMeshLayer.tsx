'use client'

import { GeoJSON } from 'react-leaflet'
import { PopulationGeoJSON } from '@/types'

interface PopulationMeshLayerProps {
  data: PopulationGeoJSON | null
  isVisible: boolean
}

export default function PopulationMeshLayer({
  data,
  isVisible,
}: PopulationMeshLayerProps) {
  if (!data || !isVisible) return null

  return (
    <GeoJSON
      data={data}
      style={(feature) => ({
        color: feature?.properties?.color || '#4575b4',
        weight: 1,
        fillOpacity: feature?.properties?.fillOpacity || 0.6,
      })}
    />
  )
}
