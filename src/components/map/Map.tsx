'use client'

import { MapContainer, TileLayer, useMap, ZoomControl } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { ReactNode, useEffect, useState } from 'react'

interface MapProps {
  children?: ReactNode
  center?: [number, number]
  zoom?: number
}

const cities = [
  { name: '東根市', lat: 38.421, lon: 140.396 },
  { name: '天童市', lat: 38.353, lon: 140.369 },
  { name: '村山市', lat: 38.475, lon: 140.391 },
  { name: '河北町', lat: 38.429, lon: 140.319 },
]

const transportPoints = [
  { name: 'さくらんぼ東根駅', lat: 38.4266, lon: 140.3908, type: 'station' },
  { name: '神町駅', lat: 38.4215, lon: 140.4032, type: 'station' },
  { name: '山形空港', lat: 38.4119, lon: 140.3712, type: 'airport' },
]

import { Marker, Tooltip } from 'react-leaflet'
import L from 'leaflet'

const CityLabels = () => (
  <>
    {cities.map(city => (
      <Marker
        key={city.name}
        position={[city.lat, city.lon]}
        icon={L.divIcon({
          className: 'city-label',
          html: city.name,
        })}
        interactive={false}
      />
    ))}
  </>
)

const TransportPoints = () => (
  <>
    {transportPoints.map(p => (
      <Marker
        key={p.name}
        position={[p.lat, p.lon]}
        icon={L.divIcon({
          className: `transport-label ${p.type}`,
          html: `
            <div class="icon"></div>
            <div class="text">${p.name}</div>
          `,
        })}
        interactive={false}
      />
    ))}
  </>
)

const ZoomControlledLabels = () => {
  const map = useMap()
  const [zoom, setZoom] = useState(map.getZoom())

  useEffect(() => {
    map.on('zoomend', () => setZoom(map.getZoom()))
  }, [map])

  return (
    <>
      {zoom <= 12 && <CityLabels />}
      {/* {zoom >= 13 && <TransportPoints />} */}
    </>
  )
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
        url="https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png"
      />
      <ZoomControl position="bottomright" />
      <ZoomControlledLabels />
      {children}
    </MapContainer>
  )
}
