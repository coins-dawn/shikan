'use client'

import { useAppState } from '@/hooks/useAppState'
import Header from '@/components/layout/Header'
import UnifiedMapView from '@/components/map/UnifiedMapView'

export default function Home() {
  const {
    state,
    navigateTo,
    updateCondition,
    updateBusCondition,
    executeSearch,
    getCurrentReachability,
    getCurrentSpots,
    getSpotTypes,
    getSelectedBusStops,
  } = useAppState()

  const reachability = getCurrentReachability()
  const spots = getCurrentSpots()
  const spotTypes = getSpotTypes()
  const selectedBusStops = getSelectedBusStops()

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
          spotTypes={spotTypes}
          reachability={reachability}
          spots={spots}
          selectedBusStops={selectedBusStops}
          searchResult={state.searchResult}
          isLoading={state.isLoading}
          loadingMessage={state.loadingMessage}
          onUpdateCondition={updateCondition}
          onUpdateBusCondition={updateBusCondition}
          onNavigateToSimple={() => navigateTo('bus-simple')}
          onExecuteSearch={executeSearch}
        />
      </main>
    </div>
  )
}
