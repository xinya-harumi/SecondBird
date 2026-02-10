'use client'

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
}

export default function BirdInfoCard({ bird, userName }: BirdInfoCardProps) {
  const speciesData = BIRD_SPECIES.find(s => s.name === bird.species.name)
  const currentLocation = speciesData ? getBirdCurrentLocation(speciesData) : null

  return (
    <div className="space-y-4">
      {/* 鸟的头像和名字 */}
      <div className="text-center">
        <div className="text-6xl mb-2">{speciesData?.imageEmoji || '🐦'}</div>
        <h2 className="text-xl font-bold text-gray-800">{bird.name}</h2>
        <p className="text-sm text-gray-500">{bird.species.name} · {bird.species.englishName}</p>
      </div>

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
