import MapView from '@/components/MapView'
import { fetchBusStops } from '@/lib/busStops'

export default async function Home() {
  const busStops = await fetchBusStops()

  return <MapView busStops={busStops} />
}
