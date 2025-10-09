// スポットタイプの日本語ラベル
export const SPOT_LABELS: Record<string, string> = {
  hospital: '病院',
  shopping: '商業施設',
  'public-facility': '公共施設',
}

// APIから取得したタイプに対応する日本語ラベルを取得
// マッピングにない場合はタイプ名をそのまま返す
export function getSpotLabel(type: string): string {
  return SPOT_LABELS[type] || type
}
