'use client'

import { useState, useEffect } from 'react'

/**
 * ブレークポイント判定用のカスタムフック
 * @param query - メディアクエリ文字列（例: '(max-width: 639px)'）
 * @returns クエリがマッチしているかどうか
 */
export function useMediaQuery(query: string): boolean {
  // 初期値をtrueにすることで、デスクトップユーザーのちらつきを防ぐ
  // (790px以上のブレークポイントを想定)
  const [matches, setMatches] = useState(true)

  useEffect(() => {
    // サーバーサイドレンダリング時はfalseを返す
    if (typeof window === 'undefined') {
      return
    }

    const media = window.matchMedia(query)

    // 初期値を設定
    setMatches(media.matches)

    // メディアクエリの変更を監視
    const listener = () => setMatches(media.matches)
    media.addEventListener('change', listener)

    // クリーンアップ
    return () => media.removeEventListener('change', listener)
  }, [query])

  return matches
}
