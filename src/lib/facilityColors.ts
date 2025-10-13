import { FacilityType } from '@/types'

export interface FacilityColorTheme {
  light: string // 到達圏1（現状）用の薄色
  dark: string // 到達圏2（コミュニティバス導入後）用の濃色
}

// 種別ごとのカラーテーマ定義
const facilityColorThemes: Record<string, FacilityColorTheme> = {
  hospital: {
    light: '#fca5a5', // 薄い赤
    dark: '#dc2626', // 濃い赤
  },
  shopping: {
    light: '#93c5fd', // 薄い青
    dark: '#2563eb', // 濃い青
  },
  park: {
    light: '#86efac', // 薄い緑
    dark: '#16a34a', // 濃い緑
  },
  school: {
    light: '#fde047', // 薄い黄
    dark: '#ca8a04', // 濃い黄
  },
  station: {
    light: '#c4b5fd', // 薄い紫
    dark: '#7c3aed', // 濃い紫
  },
  library: {
    light: '#fdba74', // 薄いオレンジ
    dark: '#ea580c', // 濃いオレンジ
  },
  restaurant: {
    light: '#fda4af', // 薄いピンク
    dark: '#e11d48', // 濃いピンク
  },
}

// デフォルトのカラーテーマ（未知の種別用）
const defaultColorTheme: FacilityColorTheme = {
  light: '#d1d5db', // 薄いグレー
  dark: '#6b7280', // 濃いグレー
}

/**
 * 施設種別に応じたカラーテーマを取得
 * @param facilityType 施設種別
 * @returns カラーテーマ（light: 到達圏1用、dark: 到達圏2用）
 */
export function getFacilityColorTheme(facilityType: FacilityType): FacilityColorTheme {
  return facilityColorThemes[facilityType] || defaultColorTheme
}
