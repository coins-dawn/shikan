'use client'

import { useAppState } from '@/hooks/useAppState'
import Header from '@/components/layout/Header'
import ConditionMapView from '@/components/condition/ConditionMapView'
import SimpleMapView from '@/components/bus-simple/SimpleMapView'
import ResultMapView from '@/components/result/ResultMapView'

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
      <main className="flex-1 relative">
        {state.currentScreen === 'condition' && (
          <ConditionMapView
            condition={state.condition}
            spotTypes={spotTypes}
            reachability={reachability}
            spots={spots}
            isLoading={state.isLoading}
            loadingMessage={state.loadingMessage}
            onUpdateCondition={updateCondition}
            onNext={() => navigateTo('bus-simple')}
          />
        )}

        {state.currentScreen === 'bus-simple' && (
          <SimpleMapView
            condition={state.condition}
            busCondition={state.busCondition}
            reachability={reachability}
            spots={spots}
            selectedBusStops={selectedBusStops}
            isLoading={state.isLoading}
            loadingMessage={state.loadingMessage}
            onUpdateBusCondition={updateBusCondition}
            onNext={executeSearch}
          />
        )}

        {state.currentScreen === 'result' && (
          <ResultMapView
            condition={state.condition}
            reachability={reachability}
            spots={spots}
            searchResult={state.searchResult}
            isLoading={state.isLoading}
            loadingMessage={state.loadingMessage}
          />
        )}
      </main>
    </div>
  )
}
