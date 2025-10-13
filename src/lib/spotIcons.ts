// スポット種別ごとのアイコンSVGパス定義
// Material Icons または Font Awesome風のシンプルなアイコンパスを使用

export interface SpotIconDefinition {
  path: string
  viewBox?: string
}

// 種別ごとのアイコンSVGパス
export const spotIconPaths: Record<string, SpotIconDefinition> = {
  hospital: {
    // 病院の十字マーク（シンプルな十字）
    path: `
      <rect x="10" y="6" width="4" height="12" fill="white"/>
      <rect x="6" y="10" width="12" height="4" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
  shopping: {
    // ショッピングバッグ
    path: `
      <path d="M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2zm6 16H6V8h2v2c0 .55.45 1 1 1s1-.45 1-1V8h4v2c0 .55.45 1 1 1s1-.45 1-1V8h2v12z" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
  park: {
    // 公園の木
    path: `
      <path d="M17 8C17 6.34 15.66 5 14 5c-.59 0-1.14.17-1.61.46C11.85 4.06 10.53 3 9 3c-1.66 0-3 1.34-3 3 0 .35.07.68.18.98C4.84 7.57 4 8.67 4 10c0 1.66 1.34 3 3 3h1v6c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-6h1c1.66 0 3-1.34 3-3s-1.34-3-3-3z" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
  school: {
    // 学校の帽子
    path: `
      <path d="M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
  station: {
    // 駅
    path: `
      <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2l2-2h4l2 2h2v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-4-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm3.5-6H6V6h5v5zm5.5 6c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zm1.5-6h-5V6h5v5z" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
  library: {
    // 本
    path: `
      <path d="M18 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zM9 4h2v5l-1-.75L9 9V4zm9 16H6V4h1v9l3-2.25L13 13V4h5v16z" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
  restaurant: {
    // レストラン
    path: `
      <path d="M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
  'public-facility': {
    // 公共施設（建物）
    path: `
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10zm-2-8h-2v2h2v-2zm0 4h-2v2h2v-2z" fill="white"/>
    `,
    viewBox: '0 0 24 24',
  },
}

// デフォルトアイコン（円形マーカー）
export const defaultIconPath: SpotIconDefinition = {
  path: `
    <circle cx="12" cy="12" r="8" fill="white"/>
  `,
  viewBox: '0 0 24 24',
}

/**
 * スポット種別に応じたアイコンSVGパスを取得
 * @param type スポット種別
 * @returns アイコンSVGパス定義
 */
export function getSpotIconPath(type: string): SpotIconDefinition {
  return spotIconPaths[type] || defaultIconPath
}
