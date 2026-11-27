import type {
  ExpressionSpecification,
  StyleSpecification,
} from 'maplibre-gl'
import { airportArea } from './airportArea'

/**
 * 国土地理院 最適化ベクトルタイル（optimal_bvmap）を使ったシンプルな背景地図スタイル
 *
 * 表示するのは次のもののみ。建物・等高線・その他の地図記号・小さな注記などは描画しない。
 * - 山地の着色（標高に応じた薄い緑）
 * - 空港の範囲（グレー、国土数値情報より）
 * - 道路・鉄道・河川（水域）
 * - 主要な地名（市町村名・大字/町名・駅名）
 * - 空港・国道（国道番号の盾マーク、道路名）
 *
 * 注意: ここでのズームは MapLibre のズーム（= Leaflet のズーム - 1）。
 *
 * 参考:
 * - https://github.com/gsi-cyberjapan/optimal_bvmap
 * - https://maps.gsi.go.jp/help/pdf/vector/optbv_dataspec.pdf
 */

const SOURCE = 'gsi'
const DEM_SOURCE = 'gsi-dem'
const AIRPORT_SOURCE = 'airport-area'

const COLORS = {
  background: '#f1eee8',
  mountain: '#d9e7cc',
  airport: '#dcdcdc',
  airportOutline: '#c4c4c4',
  water: '#c9dcef',
  river: '#a3c4e3',
  roadCasing: '#cdc7bd',
  roadMinor: '#ffffff',
  roadPref: '#ffffff',
  roadNational: '#fbe3b4',
  roadNationalCasing: '#e3bf7f',
  roadExpressway: '#f6c48a',
  roadExpresswayCasing: '#d39b57',
  rail: '#8c8c8c',
  railDash: '#ffffff',
  labelPrimary: '#3a3a3a',
  labelSecondary: '#5f5f5f',
  labelHalo: 'rgba(255,255,255,0.9)',
  labelRoad: '#6a5a45',
  routeNumber: '#ffffff',
} as const

/**
 * 山地の着色（標高 → 色）
 *
 * 東根市の市街地（盆地）は標高 100〜150m 程度のため、180m 以上を山地として単色の薄い緑で塗る。
 * 地理院 DEM の欠測値（海など）は約 83,886m として読み込まれるため、4,000m 超は透明にする。
 * color-relief は interpolate 式のみ受け付けるため、近接した2点で段差を作り単色にしている。
 */
const MOUNTAIN_MIN_ELEVATION = 180
const DEM_MAX_VALID_ELEVATION = 4000
const mountainTint: ExpressionSpecification = [
  'interpolate',
  ['linear'],
  ['elevation'],
  MOUNTAIN_MIN_ELEVATION - 0.1, 'rgba(0, 0, 0, 0)',
  MOUNTAIN_MIN_ELEVATION, COLORS.mountain,
  DEM_MAX_VALID_ELEVATION, COLORS.mountain,
  DEM_MAX_VALID_ELEVATION + 0.1, 'rgba(0, 0, 0, 0)',
]

/** 注記（Anno）の vt_code */
const ANNO_CODE = {
  municipality: 110, // 市区町村名
  district: 210, // 大字・町名
  station: 422, // 駅名
  roadName: 411, // 道路名（羽州街道、関山街道など）
  airport: 441, // 空港名
  nationalRouteNumber: 2901, // 国道番号
} as const

/** 地理院地図（標準地図）のスプライト内のアイコン名 */
const SPRITE_ICON = {
  airport: '国際空港以外の拠点空港等-20',
  nationalRoute: '国道番号-20',
} as const

// ---- 道路 ----------------------------------------------------------------

type RoadClass = 'expressway' | 'national' | 'pref' | 'minor'

const isExpressway: ExpressionSpecification = [
  'any',
  ['==', ['get', 'vt_motorway'], 1],
  ['==', ['get', 'vt_rdctg'], '高速自動車国道等'],
]

const roadClassFilter: Record<RoadClass, ExpressionSpecification> = {
  expressway: isExpressway,
  national: [
    'all',
    ['!', isExpressway],
    ['in', ['get', 'vt_rdctg'], ['literal', ['国道', '主要道路']]],
  ],
  pref: [
    'all',
    ['!', isExpressway],
    ['==', ['get', 'vt_rdctg'], '都道府県道'],
  ],
  minor: [
    'all',
    ['!', isExpressway],
    [
      '!',
      ['in', ['get', 'vt_rdctg'], ['literal', ['国道', '主要道路', '都道府県道']]],
    ],
  ],
}

/** ズームごとの線幅（[zoom, width] の組） */
const roadWidthStops: Record<RoadClass, number[]> = {
  expressway: [7, 1.2, 10, 2, 13, 4, 16, 10],
  national: [7, 0.8, 10, 1.6, 13, 3.5, 16, 9],
  pref: [9, 0.6, 11, 1.2, 13, 3, 16, 8],
  minor: [11, 0.4, 13, 1.5, 16, 6],
}

const roadMinZoom: Record<RoadClass, number> = {
  expressway: 0,
  national: 0,
  pref: 9,
  minor: 11,
}

const roadColors: Record<RoadClass, { fill: string; casing: string }> = {
  expressway: { fill: COLORS.roadExpressway, casing: COLORS.roadExpresswayCasing },
  national: { fill: COLORS.roadNational, casing: COLORS.roadNationalCasing },
  pref: { fill: COLORS.roadPref, casing: COLORS.roadCasing },
  minor: { fill: COLORS.roadMinor, casing: COLORS.roadCasing },
}

const widthExpr = (stops: number[], extra = 0): ExpressionSpecification =>
  [
    'interpolate',
    ['exponential', 1.4],
    ['zoom'],
    ...stops.map((v, i) => (i % 2 === 1 ? v + extra : v)),
  ] as ExpressionSpecification

/** トンネル部（vt_code 27x4）は薄く表示 */
const roadOpacity: ExpressionSpecification = [
  'case',
  ['in', ['get', 'vt_code'], ['literal', [2704, 2714, 2724, 2734]]],
  0.35,
  1,
]

/** 細い道路（軽車道等, vt_code 2711）は高ズームのみ表示 */
const hideNarrowRoadsBelowZ15: ExpressionSpecification = [
  'step',
  ['zoom'],
  ['!=', ['get', 'vt_code'], 2711],
  15,
  true,
]

const roadLayers = (part: 'casing' | 'fill'): StyleSpecification['layers'] =>
  (['minor', 'pref', 'national', 'expressway'] as RoadClass[]).map(cls => ({
    id: `road-${cls}-${part}`,
    type: 'line',
    source: SOURCE,
    'source-layer': 'RdCL',
    minzoom: roadMinZoom[cls],
    filter: ['all', roadClassFilter[cls], hideNarrowRoadsBelowZ15],
    layout: { 'line-cap': 'round', 'line-join': 'round' },
    paint: {
      'line-color': roadColors[cls][part],
      'line-width': widthExpr(roadWidthStops[cls], part === 'casing' ? 1.2 : 0),
      'line-opacity': roadOpacity,
    },
  }))

// ---- 鉄道 ----------------------------------------------------------------

const railFilter: ExpressionSpecification = [
  'in',
  ['get', 'vt_rtcode'],
  ['literal', ['JR', 'JR以外', '地下鉄', '路面']],
]

const railOpacity: ExpressionSpecification = [
  'case',
  ['in', ['get', 'vt_railstate'], ['literal', ['トンネル', '雪覆い', '地下']]],
  0.35,
  1,
]

// ---- 注記 ----------------------------------------------------------------

const pointAnno = (code: number): ExpressionSpecification => [
  'all',
  ['==', ['geometry-type'], 'Point'],
  ['==', ['get', 'vt_code'], code],
]

const labelLayout = (size: ExpressionSpecification | number) => ({
  'text-field': ['get', 'vt_text'] as ExpressionSpecification,
  'text-font': ['NotoSansJP-Regular'],
  'text-size': size,
  'text-max-width': 12,
  'text-padding': 4,
})

const labelPaint = (color: string) => ({
  'text-color': color,
  'text-halo-color': COLORS.labelHalo,
  'text-halo-width': 1.6,
})

export const gsiSimpleStyle: StyleSpecification = {
  version: 8,
  glyphs:
    'https://gsi-cyberjapan.github.io/optimal_bvmap/glyphs/{fontstack}/{range}.pbf',
  // 空港アイコン・国道番号の盾マークに使用
  sprite: 'https://gsi-cyberjapan.github.io/optimal_bvmap/sprite/std',
  sources: {
    [SOURCE]: {
      type: 'vector',
      tiles: [
        'https://cyberjapandata.gsi.go.jp/xyz/optimal_bvmap-v1/{z}/{x}/{y}.pbf',
      ],
      minzoom: 4,
      maxzoom: 16,
      // 出典表示は GsiVectorBaseLayer で行う
    },
    // 標高タイル（地理院 DEM PNG）
    // 標高 = (R × 2^16 + G × 2^8 + B) × 0.01 m
    [DEM_SOURCE]: {
      type: 'raster-dem',
      tiles: ['https://cyberjapandata.gsi.go.jp/xyz/dem_png/{z}/{x}/{y}.png'],
      tileSize: 256,
      minzoom: 1,
      maxzoom: 14,
      encoding: 'custom',
      redFactor: 655.36,
      greenFactor: 2.56,
      blueFactor: 0.01,
      baseShift: 0,
    },
    // 空港の範囲（国土数値情報 空港データ）
    [AIRPORT_SOURCE]: {
      type: 'geojson',
      data: airportArea,
    },
  },
  layers: [
    {
      id: 'background',
      type: 'background',
      paint: { 'background-color': COLORS.background },
    },

    // 山地の着色
    {
      id: 'mountain-tint',
      type: 'color-relief',
      source: DEM_SOURCE,
      paint: { 'color-relief-color': mountainTint },
    },

    // 空港の範囲
    {
      id: 'airport-area',
      type: 'fill',
      source: AIRPORT_SOURCE,
      paint: {
        'fill-color': COLORS.airport,
        'fill-outline-color': COLORS.airportOutline,
      },
    },

    // 河川・水域
    {
      id: 'water-area',
      type: 'fill',
      source: SOURCE,
      'source-layer': 'WA',
      paint: { 'fill-color': COLORS.water },
    },
    {
      id: 'river',
      type: 'line',
      source: SOURCE,
      'source-layer': 'RvrCL',
      // 枯れ川部(5302)・地下の人工水路(5322)は除外
      filter: ['!', ['in', ['get', 'vt_code'], ['literal', [5302, 5322]]]],
      layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: {
        'line-color': COLORS.river,
        'line-width': ['interpolate', ['linear'], ['zoom'], 9, 0.6, 13, 1.2, 16, 2.5],
      },
    },

    // 道路（縁取り → 本体の順に描画し、上位道路を上に重ねる）
    ...roadLayers('casing'),
    ...roadLayers('fill'),

    // 鉄道
    {
      id: 'rail',
      type: 'line',
      source: SOURCE,
      'source-layer': 'RailCL',
      filter: railFilter,
      paint: {
        'line-color': COLORS.rail,
        'line-width': ['interpolate', ['linear'], ['zoom'], 8, 1, 13, 2.2, 16, 4],
        'line-opacity': railOpacity,
      },
    },
    {
      id: 'rail-dash',
      type: 'line',
      source: SOURCE,
      'source-layer': 'RailCL',
      minzoom: 12,
      filter: [
        'all',
        ['==', ['get', 'vt_rtcode'], 'JR'],
        ['!', ['in', ['get', 'vt_railstate'], ['literal', ['トンネル', '雪覆い', '地下']]]],
      ],
      paint: {
        'line-color': COLORS.railDash,
        'line-width': ['interpolate', ['linear'], ['zoom'], 12, 1, 16, 2.5],
        'line-dasharray': [4, 4],
      },
    },

    // 道路名（道路に沿って表示）
    {
      id: 'label-road-name',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'Anno',
      filter: [
        'all',
        ['==', ['geometry-type'], 'LineString'],
        ['==', ['get', 'vt_code'], ANNO_CODE.roadName],
      ],
      layout: {
        ...labelLayout(11),
        'symbol-placement': 'line',
        'symbol-spacing': 400,
      },
      paint: labelPaint(COLORS.labelRoad),
    },

    // 主要な地名
    {
      id: 'label-district',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'Anno',
      filter: pointAnno(ANNO_CODE.district),
      layout: labelLayout([
        'interpolate',
        ['linear'],
        ['zoom'],
        13,
        11,
        16,
        13,
      ]),
      paint: labelPaint(COLORS.labelSecondary),
    },
    {
      id: 'label-station',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'Anno',
      filter: pointAnno(ANNO_CODE.station),
      layout: labelLayout(12),
      paint: labelPaint(COLORS.labelPrimary),
    },

    // 空港（アイコン + 名前）
    {
      id: 'label-airport',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'Anno',
      filter: pointAnno(ANNO_CODE.airport),
      layout: {
        ...labelLayout(12),
        'icon-image': SPRITE_ICON.airport,
        'icon-size': 0.55,
        'text-anchor': 'top',
        'text-offset': [0, 0.9],
      },
      paint: labelPaint(COLORS.labelPrimary),
    },

    // 国道番号（盾マーク）
    {
      id: 'label-national-route-number',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'Anno',
      filter: pointAnno(ANNO_CODE.nationalRouteNumber),
      layout: {
        'icon-image': SPRITE_ICON.nationalRoute,
        'icon-size': 0.55,
        'text-field': ['get', 'vt_text'],
        'text-font': ['NotoSansJP-Regular'],
        'text-size': 11,
        'icon-padding': 6,
      },
      paint: { 'text-color': COLORS.routeNumber },
    },

    {
      id: 'label-municipality',
      type: 'symbol',
      source: SOURCE,
      'source-layer': 'Anno',
      filter: pointAnno(ANNO_CODE.municipality),
      layout: labelLayout(['interpolate', ['linear'], ['zoom'], 8, 12, 12, 15]),
      paint: labelPaint(COLORS.labelPrimary),
    },
  ],
}
