'use client'

import { GeoJSON } from 'react-leaflet'
import { PopulationGeoJSON } from '@/types'

interface PopulationLayerProps {
  data: PopulationGeoJSON | null
}

export default function PopulationLayer({ data }: PopulationLayerProps) {
  if (!data) return null

  return (
    <GeoJSON
      data={data}
      style={(feature) => ({
        color: feature?.properties?.color || '#ff6600',
        fillColor: feature?.properties?.color || '#ff6600',
        fillOpacity: feature?.properties?.fillOpacity || 0.7,
        weight: 0,
      })}
    />
  )
}
