import MapView from '@/components/MapView'
import { fetchBusStops } from '@/lib/busStops'
import { fetchSpots } from '@/lib/spots'
import { SPOT_LABELS } from '@/lib/spotLabels'

export default async function Home() {
  const busStops = await fetchBusStops()
  const { spots, types: spotTypes } = await fetchSpots()

  // スポットラベルマップを作成
  const spotLabels = spotTypes.reduce((acc, type) => {
    acc[type] = SPOT_LABELS[type] || type
    return acc
  }, {} as Record<string, string>)

  return (
    <MapView
      busStops={busStops}
      spots={spots}
      spotTypes={spotTypes}
      spotLabels={spotLabels}
    />
  )
}
