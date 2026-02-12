'use client'

import { useState } from 'react'
import { BIRD_SPECIES, getBirdCurrentLocation } from '@/data/birds'

interface BirdInfoCardProps {
  bird: {
    id: string
    name: string
    personality: string
    currentLocation: string
    currentLat: number
    currentLng: number
    species: {
      name: string
      englishName: string
      description: string
    }
  }
  userName: string
  onBirdChanged?: () => void
}

export default function BirdInfoCard({ bird, userName, onBirdChanged }: BirdInfoCardProps) {
  const [showSelector, setShowSelector] = useState(false)
  const [changing, setChanging] = useState(false)

  const speciesData = BIRD_SPECIES.find(s => s.name === bird.species.name)
  const currentLocation = speciesData ? getBirdCurrentLocation(speciesData) : null

  const handleChangeBird = async (speciesId: string) => {
    setChanging(true)
    try {
      const res = await fetch('/api/bird/change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ speciesId }),
      })

      if (res.ok) {
        setShowSelector(false)
        onBirdChanged?.()
      }
    } catch (error) {
      console.error('Failed to change bird:', error)
    } finally {
      setChanging(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* 鸟的头像和名字 */}
      <div className="text-center">
        <div className="text-6xl mb-2">{speciesData?.imageEmoji || '🐦'}</div>
        <h2 className="text-xl font-bold text-gray-800">{bird.name}</h2>
        <p className="text-sm text-gray-500">{bird.species.name} · {bird.species.englishName}</p>
        <button
          onClick={() => setShowSelector(true)}
          className="mt-2 text-xs text-primary-600 hover:text-primary-700"
        >
          切换鸟类
        </button>
      </div>

      {/* 鸟类选择弹窗 */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999]">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto relative">
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowSelector(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
            <h3 className="text-lg font-bold text-gray-800 mb-4">选择你的候鸟</h3>
            <div className="space-y-3">
              {BIRD_SPECIES.map((species) => (
                <button
                  key={species.id}
                  onClick={() => handleChangeBird(species.id)}
                  disabled={changing || species.name === bird.species.name}
                  className={`w-full p-3 rounded-lg border text-left transition-colors ${
                    species.name === bird.species.name
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  } ${changing ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{species.imageEmoji}</span>
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {species.name}
                        {species.name === bird.species.name && (
                          <span className="ml-2 text-xs text-primary-600">当前</span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{species.englishName}</div>
                      <div className="text-xs text-gray-600 mt-1 line-clamp-2">
                        {species.description}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 当前状态 */}
      <div className="card bg-primary-50 border-primary-100">
        <div className="text-sm text-primary-600 font-medium mb-1">当前状态</div>
        <div className="text-gray-800">
          <div className="font-medium">{bird.currentLocation}</div>
          {currentLocation && (
            <div className="text-sm text-gray-600 mt-1">
              正在{currentLocation.activity}
            </div>
          )}
        </div>
      </div>

      {/* 性格特点 */}
      <div className="card">
        <div className="text-sm text-gray-500 mb-2">性格特点</div>
        <div className="flex flex-wrap gap-2">
          {bird.personality.split('、').map((trait, i) => (
            <span
              key={i}
              className="px-2 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
            >
              {trait}
            </span>
          ))}
        </div>
      </div>

      {/* 物种介绍 */}
      <div className="card">
        <div className="text-sm text-gray-500 mb-2">关于{bird.species.name}</div>
        <p className="text-sm text-gray-700 leading-relaxed">
          {bird.species.description}
        </p>
      </div>

      {/* 迁徙路线预览 */}
      {speciesData && (
        <div className="card">
          <div className="text-sm text-gray-500 mb-2">年度迁徙路线</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {speciesData.migrationRoute.map((point, i) => (
              <div
                key={i}
                className={`flex items-center gap-2 text-sm ${
                  point.month === new Date().getMonth() + 1
                    ? 'text-primary-600 font-medium'
                    : 'text-gray-600'
                }`}
              >
                <span className="w-8">{point.month}月</span>
                <span className="flex-1">{point.location}</span>
                {point.month === new Date().getMonth() + 1 && (
                  <span className="text-xs bg-primary-100 text-primary-600 px-2 py-0.5 rounded">
                    现在
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
