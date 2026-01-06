'use client'

import { useAppState } from '@/hooks/useAppState'
import Header from '@/components/layout/Header'
import UnifiedMapView from '@/components/map/UnifiedMapView'

export default function Home() {
  const {
    state,
    mapCenter,
    navigateTo,
    updateCondition,
    updateBusCondition,
    executeSearch,
    getCurrentReachability,
    getCurrentSpots,
    getSpots,
    getAllMatchingRoutes,
    getSelectedBusStops,
    toggleManualBusStop,
    updateManualBusStops,
    getManualBusStops,
    getAvailableDepartureTimes,
    togglePublicTransit,
  } = useAppState()

  const reachability = getCurrentReachability()
  const spots = getCurrentSpots()
  const allSpots = getSpots()
  const allRoutes = getAllMatchingRoutes()
  const selectedBusStops = getSelectedBusStops()
  const manualBusStops = getManualBusStops()
  const allBusStops = state.busStopsData || []
  const availableDepartureTimes = getAvailableDepartureTimes()

  // ルート選択ハンドラー
  const handleSelectRoute = (index: number) => {
    updateBusCondition({ selectedRouteIndex: index })
  }

  return (
    <div className="h-screen flex flex-col">
      {/* ヘッダー */}
      <Header currentScreen={state.currentScreen} onNavigate={navigateTo} />

      {/* メインコンテンツ */}
      <main className="flex-1 relative overflow-hidden">
        <UnifiedMapView
          currentScreen={state.currentScreen}
          condition={state.condition}
          busCondition={state.busCondition}
          allSpots={allSpots}
          reachability={reachability}
          spots={spots}
          selectedBusStops={selectedBusStops}
          manualBusStops={manualBusStops}
          allBusStops={allBusStops}
          searchResult={state.searchResult}
          isLoading={state.isLoading}
          loadingMessage={state.loadingMessage}
          mapCenter={mapCenter}
          allRoutes={allRoutes}
          busStopsData={allBusStops}
          publicTransitData={state.publicTransitData}
          showPublicTransit={state.showPublicTransit}
          availableDepartureTimes={availableDepartureTimes}
          onUpdateCondition={updateCondition}
          onUpdateBusCondition={updateBusCondition}
          onNavigateToSimple={() => navigateTo('bus-simple')}
          onNavigateToManual={() => navigateTo('bus-manual')}
          onExecuteSearch={executeSearch}
          onToggleManualBusStop={toggleManualBusStop}
          onUpdateManualBusStops={updateManualBusStops}
          onSelectRoute={handleSelectRoute}
          onTogglePublicTransit={togglePublicTransit}
        />
      </main>
    </div>
  )
}
