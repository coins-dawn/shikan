#!/usr/bin/env node

/**
 * ビルド前にAPI `/area/search/all` を実行し、
 * public/data/reachability.json に保存するスクリプト
 */

import { writeFileSync, mkdirSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const API_BASE_URL = 'https://prometheus-h24i.onrender.com'

async function fetchReachabilityList() {
  console.log('📡 Fetching reachability list from API...')
  console.log(`   URL: ${API_BASE_URL}/area/search/all`)

  const startTime = Date.now()

  try {
    const response = await fetch(`${API_BASE_URL}/area/search/all`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Successfully fetched reachability list (${elapsed}s)`)

    return data
  } catch (error) {
    console.error('❌ Failed to fetch reachability list:', error)
    throw error
  }
}

async function fetchPublicTransit() {
  console.log('📡 Fetching public transit data from API...')
  console.log(`   URL: ${API_BASE_URL}/target/ptrans`)

  const startTime = Date.now()

  try {
    const response = await fetch(`${API_BASE_URL}/target/ptrans`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Successfully fetched public transit data (${elapsed}s)`)

    // stopsを生成
    const arraySetEquals = (a, b) => {
      if (a.length !== b.length) return false
      const setA = new Set(a)
      const setB = new Set(b)
      if (setA.size !== setB.size) return false
      for (const v of setA) {
        if (!setB.has(v)) return false
      }
      return true
    }

    const isSameLine = (a, b) =>
      a.index === b.index && arraySetEquals(a.times, b.times)

    const stopMap = data.result.routes.reduce((map, route, index) => {
      return route.stops.reduce((innerMap, stop) => {
        const existing = innerMap.get(stop.id)

        const newLine = {
          index: index,
          name: route.name,
          times: stop.times,
        }

        const nextValue = existing
          ? {
            ...existing,
            lines: existing.lines.some(line => isSameLine(line, newLine))
              ? existing.lines
              : [...existing.lines, newLine],
          }
          : {
            id: stop.id,
            lat: stop.lat,
            lon: stop.lon,
            name: stop.name,
            lines: [newLine],
          }

        innerMap.set(stop.id, nextValue)
        return innerMap
      }, map)
    }, new Map())

    return { ...data, result: { ...data.result, stops: [...stopMap.values()] } }
  } catch (error) {
    console.error('❌ Failed to fetch public transit data:', error)
    throw error
  }
}

async function fetchPopulationMesh() {
  console.log('📡 Fetching population mesh data from API...')
  console.log(`   URL: ${API_BASE_URL}/target/mesh`)

  const startTime = Date.now()

  try {
    const response = await fetch(`${API_BASE_URL}/target/mesh`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(2)
    console.log(`✅ Successfully fetched population mesh data (${elapsed}s)`)

    // 人口密度に応じた色を返す関数
    const getPopulationColor = (population) => {
      if (population <= 10) return '#4575b4'
      if (population <= 50) return '#1a9850'
      if (population <= 100) return '#91cf60'
      if (population <= 200) return '#d9ef8b'
      return '#fee08b'
    }

    // FeatureCollection形式に変換
    const featureCollection = {
      type: 'FeatureCollection',
      features: data.result.map((item) => ({
        type: 'Feature',
        geometry: item.geometry,
        properties: {
          meshCode: item.mesh_code,
          population: item.population,
          color: getPopulationColor(item.population),
          fillOpacity: 0.6,
        },
      })),
    }

    return featureCollection
  } catch (error) {
    console.error('❌ Failed to fetch population mesh data:', error)
    throw error
  }
}

async function main() {
  try {
    // APIから到達圏データ、公共交通データ、人口メッシュデータを並列取得
    const [reachabilityData, publicTransitData, populationMeshData] = await Promise.all([
      fetchReachabilityList(),
      fetchPublicTransit(),
      fetchPopulationMesh(),
    ])

    // public/data ディレクトリを作成（存在しない場合）
    const publicDataDir = join(__dirname, '..', 'public', 'data')
    mkdirSync(publicDataDir, { recursive: true })

    // 到達圏データをJSONファイルに保存
    const reachabilityPath = join(publicDataDir, 'reachability.json')
    writeFileSync(reachabilityPath, JSON.stringify(reachabilityData, null, 2), 'utf-8')
    console.log(`💾 Saved reachability data to: ${reachabilityPath}`)
    console.log(`   File size: ${(JSON.stringify(reachabilityData).length / 1024).toFixed(2)} KB`)

    // 公共交通データをJSONファイルに保存
    const publicTransitPath = join(publicDataDir, 'ptrans.json')
    writeFileSync(publicTransitPath, JSON.stringify(publicTransitData, null, 2), 'utf-8')
    console.log(`💾 Saved public transit data to: ${publicTransitPath}`)
    console.log(`   File size: ${(JSON.stringify(publicTransitData).length / 1024).toFixed(2)} KB`)

    // 人口メッシュデータをJSONファイルに保存
    const populationMeshPath = join(publicDataDir, 'population-mesh.json')
    writeFileSync(populationMeshPath, JSON.stringify(populationMeshData, null, 2), 'utf-8')
    console.log(`💾 Saved population mesh data to: ${populationMeshPath}`)
    console.log(`   File size: ${(JSON.stringify(populationMeshData).length / 1024).toFixed(2)} KB`)

    console.log('✨ Prebuild completed successfully!')
  } catch (error) {
    console.error('❌ Prebuild failed:', error)
    process.exit(1)
  }
}

main()
