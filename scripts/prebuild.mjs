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

async function main() {
  try {
    // API から到達圏データを取得
    const data = await fetchReachabilityList()

    // public/data ディレクトリを作成（存在しない場合）
    const publicDataDir = join(__dirname, '..', 'public', 'data')
    mkdirSync(publicDataDir, { recursive: true })

    // JSON ファイルに保存
    const outputPath = join(publicDataDir, 'reachability.json')
    writeFileSync(outputPath, JSON.stringify(data, null, 2), 'utf-8')

    console.log(`💾 Saved reachability data to: ${outputPath}`)
    console.log(`   File size: ${(JSON.stringify(data).length / 1024).toFixed(2)} KB`)
    console.log('✨ Prebuild completed successfully!')
  } catch (error) {
    console.error('❌ Prebuild failed:', error)
    process.exit(1)
  }
}

main()
