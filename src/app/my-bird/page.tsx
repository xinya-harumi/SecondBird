'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { BIRD_SPECIES, getBirdCurrentLocation } from '@/data/birds'

interface UserData {
  id: string
  name: string
  avatarUrl: string
  bird: {
    id: string
    name: string
    personality: string
    currentLocation: string
    species: {
      name: string
      englishName: string
      description: string
    }
  }
}

export default function MyBirdPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  const speciesData = BIRD_SPECIES.find(s => s.name === user.bird.species.name)
  const currentLocation = speciesData ? getBirdCurrentLocation(speciesData) : null

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {/* 鸟的大头像 */}
          <div className="text-center mb-8">
            <div className="text-8xl mb-4">{speciesData?.imageEmoji || '🐦'}</div>
            <h1 className="text-3xl font-bold text-gray-800">{user.bird.name}</h1>
            <p className="text-lg text-gray-600 mt-2">
              {user.bird.species.name} · {user.bird.species.englishName}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 当前状态 */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">当前状态</h2>
              <div className="space-y-3">
                <div>
                  <div className="text-sm text-gray-500">位置</div>
                  <div className="text-lg font-medium text-gray-800">
                    {user.bird.currentLocation}
                  </div>
                </div>
                {currentLocation && (
                  <div>
                    <div className="text-sm text-gray-500">活动</div>
                    <div className="text-lg font-medium text-primary-600">
                      {currentLocation.activity}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 性格特点 */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">性格特点</h2>
              <div className="flex flex-wrap gap-2">
                {user.bird.personality.split('、').map((trait, i) => (
                  <span
                    key={i}
                    className="px-3 py-1.5 bg-primary-50 text-primary-700 rounded-full"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </div>

            {/* 物种介绍 */}
            <div className="card md:col-span-2">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                关于{user.bird.species.name}
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {user.bird.species.description}
              </p>
            </div>

            {/* 迁徙路线 */}
            {speciesData && (
              <div className="card md:col-span-2">
                <h2 className="text-lg font-bold text-gray-800 mb-4">年度迁徙路线</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {speciesData.migrationRoute.map((point, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-lg ${
                        point.month === new Date().getMonth() + 1
                          ? 'bg-primary-50 border-2 border-primary-200'
                          : 'bg-gray-50'
                      }`}
                    >
                      <div className="text-sm font-medium text-gray-500">
                        {point.month}月
                      </div>
                      <div className="font-medium text-gray-800 mt-1">
                        {point.location}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {point.activity}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
