'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

interface UserData {
  id: string
  name: string
  avatarUrl: string
  bird: any
}

interface Encounter {
  id: string
  location: string
  weather: string
  scene: string
  story: string
  encounteredAt: string
  bird: {
    name: string
    species: { name: string }
    user: { name: string }
  }
  metBird: {
    name: string
    species: { name: string }
    user: { name: string }
  }
}

export default function FriendsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [userRes, encountersRes] = await Promise.all([
        fetch('/api/user'),
        fetch('/api/encounters'),
      ])

      if (userRes.ok) {
        const userData = await userRes.json()
        setUser(userData)
      } else {
        window.location.href = '/'
        return
      }

      if (encountersRes.ok) {
        const encountersData = await encountersRes.json()
        setEncounters(encountersData.encounters || [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
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
        <div className="max-w-4xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">鸟友圈</h1>

          {encounters.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">🌍</div>
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                还没有相遇记录
              </h2>
              <p className="text-gray-600">
                你的鸟正在迁徙途中，很快就会遇到其他鸟友
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {encounters.map((encounter) => (
                <div key={encounter.id} className="card">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🤝</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-gray-800">
                          {encounter.bird.name}
                        </span>
                        <span className="text-gray-400">与</span>
                        <span className="font-medium text-gray-800">
                          {encounter.metBird.name}
                        </span>
                        <span className="text-gray-400">相遇了</span>
                      </div>
                      <div className="text-sm text-gray-600 mb-2">
                        📍 {encounter.location}
                        {encounter.weather && ` · ${encounter.weather}`}
                      </div>
                      {encounter.story && (
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {encounter.story}
                        </p>
                      )}
                      <div className="text-xs text-gray-400 mt-2">
                        {new Date(encounter.encounteredAt).toLocaleDateString('zh-CN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
