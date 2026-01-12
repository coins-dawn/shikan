'use client'

import { useState } from "react"

export default function AboutPage() {
  const email = 'coinsdawn2011@gmail.com'
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    await navigator.clipboard.writeText(email)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 relative">
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-20"
        style={{ backgroundImage: 'url(/background.png)' }}
      />
      <div className="max-w-7xl mx-auto bg-white rounded-lg shadow-md p-8 relative z-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">
          このサイトについて
        </h1>
        <div className="text-gray-700">
          <p>このWebサービスは公共交通オープンデータチャレンジ2025の応募作品です。</p>
        </div>
        <div className="text-gray-700 mt-4">
          <p>本アプリケーション等が利用する公共交通データの一部は、公共交通交通オープンデータセンターにおいて提供されるものです。</p>
          <p>公共交通事業者により提供されたデータを元にしていますが、必ずしも正確・完全なものとは限りません。</p>
        </div>
        <div className="text-gray-700 mt-4">
          <p>本アプリケーションの表示内容について、公共交通事業者への直接の問合せは行わないでください。</p>
          <p>本アプリケーションに関するお問い合わせは、以下のメールアドレスにお願いします。</p>
          <p className="group inline-flex items-center gap-2">
            <span className="select-all">{email}</span>
            <button
              onClick={copyEmail}
              className="opacity-0 group-hover:opacity-100 transition text-xs px-2 py-0.5 rounded bg-gray-200 hover:bg-gray-300"
            >
              {copied ? 'コピー済み' : 'コピー'}
            </button>
          </p>
        </div>
        <div className="text-gray-700 mt-4">
          <p>本サービスについて、以下の動画で紹介しています。</p>
          <a className="underline" href="https://youtu.be/iqeh7nqMq7w?si=wLcU9_N_T3ulOmrQ" target="_blank">Youtubeに移動</a>
        </div>
      </div>
    </div>
  )
}
