'use client'

import { useEffect } from 'react'
import { useMap } from 'react-leaflet'
import L from 'leaflet'
import '@maplibre/maplibre-gl-leaflet'
import 'maplibre-gl/dist/maplibre-gl.css'
import { gsiSimpleStyle } from '@/lib/map/gsiSimpleStyle'

const ATTRIBUTION = [
  '<a href="https://maps.gsi.go.jp/development/ichiran.html" target="_blank" rel="noopener noreferrer">国土地理院</a>（最適化ベクトルタイル・標高タイルを加工して作成）',
  '「<a href="https://nlftp.mlit.go.jp/ksj/" target="_blank" rel="noopener noreferrer">国土数値情報（空港データ）</a>」（国土交通省）を加工して作成',
].join(' | ')

/**
 * 国土地理院ベクトルタイルを MapLibre GL で描画し、Leaflet の背景地図として表示する
 * （スタイルの内容は gsiSimpleStyle.ts を参照）
 */
export default function GsiVectorBaseLayer() {
  const map = useMap()

  useEffect(() => {
    const layer = L.maplibreGL({
      style: gsiSimpleStyle,
      attributionControl: { customAttribution: ATTRIBUTION },
      // 日本語もスタイルのグリフ（地理院配布の Noto Sans JP）で描画する。
      // ブラウザのローカルフォント描画だと全角括弧「（」が欠けることがあるため。
      localIdeographFontFamily: false,
    })
    layer.addTo(map)
    return () => {
      layer.remove()
    }
  }, [map])

  return null
}
