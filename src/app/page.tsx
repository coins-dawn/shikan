import MapView from '@/components/map/MapView'
import { fetchBusStops } from '@/lib/api/busStops'
import { fetchSpots } from '@/lib/api/spots'
import { SPOT_LABELS } from '@/lib/utils/spotLabels'

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
