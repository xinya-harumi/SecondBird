'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import LoginPage from '@/components/LoginPage'
import BirdInfoCard from '@/components/BirdInfoCard'

// 动态导入地图组件（避免 SSR 问题）
const WorldMap = dynamic(() => import('@/components/WorldMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      <div className="text-gray-500">加载地图中...</div>
    </div>
  ),
})

interface UserData {
  id: string
  name: string
  email: string
  avatarUrl: string
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
}

export default function Home() {
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
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  if (!user) {
    return <LoginPage />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 flex">
        {/* 左侧信息面板 */}
        <aside className="w-80 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <BirdInfoCard bird={user.bird} userName={user.name} />
        </aside>

        {/* 右侧地图 */}
        <div className="flex-1 relative">
          <WorldMap userId={user.id} />
        </div>
      </main>
    </div>
  )
}
