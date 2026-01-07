'use client'

import { useState, useEffect } from 'react'

interface LoadingProps {
  message?: string
}

export default function Loading({ message = '読み込み中' }: LoadingProps) {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '.') return '..'
        if (prev === '..') return '...'
        return '.'
      })
    }, 500) // 0.5秒ごとに変化

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-100">
      <div className="bg-white rounded-lg p-8 flex flex-col items-center shadow-xl">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-700 font-medium">
          {message}
          <span className="inline-block w-6 text-left">{dots}</span>
        </p>
      </div>
    </div>
  )
}
