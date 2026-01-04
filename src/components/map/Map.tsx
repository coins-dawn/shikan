'use client'

import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ReactNode } from 'react'

interface MapProps {
  children?: ReactNode
  center?: [number, number]
  zoom?: number
}

export default function Map({ children, center, zoom = 12 }: MapProps) {
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={8}
      style={{ height: '100%', width: '100%' }}
      className="z-0"
      zoomControl={false}
    >
      <TileLayer
        attribution='<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank">国土地理院</a>'
        url="https://cyberjapandata.gsi.go.jp/xyz/pale/{z}/{x}/{y}.png"
      />
      <ZoomControl position="bottomright" />
      {children}
    </MapContainer>
  )
}
