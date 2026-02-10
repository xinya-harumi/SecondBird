'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'
import { BIRD_SPECIES, getBirdCurrentLocation } from '@/data/birds'

interface UserData {
  id: string
  name: string
  avatarUrl: string
  bird: any
}

export default function EncyclopediaPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedBird, setSelectedBird] = useState<typeof BIRD_SPECIES[0] | null>(null)

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

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">鸟类百科</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {BIRD_SPECIES.map((bird) => {
              const currentLocation = getBirdCurrentLocation(bird)
              return (
                <div
                  key={bird.id}
                  className="card card-hover cursor-pointer"
                  onClick={() => setSelectedBird(bird)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-4xl">{bird.imageEmoji}</div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-800">{bird.name}</h3>
                      <p className="text-sm text-gray-500">{bird.englishName}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {bird.scientificName}
                      </p>
                      <div className="mt-2 text-sm text-primary-600">
                        📍 {currentLocation.location}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* 详情弹窗 */}
          {selectedBird && (
            <div
              className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedBird(null)}
            >
              <div
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="text-6xl">{selectedBird.imageEmoji}</div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-800">
                      {selectedBird.name}
                    </h2>
                    <p className="text-gray-600">{selectedBird.englishName}</p>
                    <p className="text-sm text-gray-400">
                      {selectedBird.scientificName}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 leading-relaxed mb-6">
                  {selectedBird.description}
                </p>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-2">性格特点</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedBird.personality.map((trait, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                      >
                        {trait}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="font-medium text-gray-800 mb-2">栖息地</h3>
                  <p className="text-gray-600">{selectedBird.habitat}</p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-800 mb-3">迁徙路线</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedBird.migrationRoute.map((point, i) => (
                      <div
                        key={i}
                        className={`p-2 rounded text-sm ${
                          point.month === new Date().getMonth() + 1
                            ? 'bg-primary-100 text-primary-800'
                            : 'bg-gray-50 text-gray-600'
                        }`}
                      >
                        <div className="font-medium">{point.month}月</div>
                        <div className="text-xs">{point.location}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  className="mt-6 w-full btn-secondary"
                  onClick={() => setSelectedBird(null)}
                >
                  关闭
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
