'use client'

import { useEffect, useState } from 'react'
import Navbar from '@/components/Navbar'

interface UserData {
  id: string
  name: string
  avatarUrl: string
  bird: any
}

interface Message {
  id: string
  content: string
  round: number
  speakerBirdId: string
  speakerBird: {
    id: string
    name: string
    species: { name: string }
  }
}

interface Conversation {
  id: string
  status: string
  attractionScore: number
  messages: Message[]
}

interface Encounter {
  id: string
  birdId: string
  metBirdId: string
  location: string
  weather: string
  scene: string
  story: string
  encounteredAt: string
  bird: {
    id: string
    name: string
    species: { name: string }
    user: { name: string }
  }
  metBird: {
    id: string
    name: string
    species: { name: string }
    user: { name: string }
  }
  conversation?: Conversation
  relationship?: {
    type: string
    strength: number
  }
}

export default function FriendsPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [encounters, setEncounters] = useState<Encounter[]>([])
  const [myBirdId, setMyBirdId] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [expandedConversation, setExpandedConversation] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  // 自动刷新：当有进行中的对话时，每 3 秒刷新一次
  useEffect(() => {
    const hasInProgressConversation = encounters.some(
      e => e.conversation && (e.conversation.status === 'pending' || e.conversation.status === 'in_progress')
    )

    if (hasInProgressConversation) {
      const timer = setInterval(() => {
        fetchEncountersOnly()
      }, 3000)

      return () => clearInterval(timer)
    }
  }, [encounters])

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
        setMyBirdId(encountersData.myBirdId || '')
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  // 只刷新 encounters 数据（不刷新 user）
  const fetchEncountersOnly = async () => {
    try {
      const res = await fetch('/api/encounters')
      if (res.ok) {
        const data = await res.json()
        setEncounters(data.encounters || [])
      }
    } catch (error) {
      console.error('Failed to fetch encounters:', error)
    }
  }

  const checkEncounters = async () => {
    setChecking(true)
    try {
      const res = await fetch('/api/encounters/check', { method: 'POST' })
      if (res.ok) {
        const data = await res.json()
        // 总是刷新数据，即使没有新相遇
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to check encounters:', error)
    } finally {
      setChecking(false)
    }
  }

  const toggleConversation = (encounterId: string) => {
    setExpandedConversation(prev => prev === encounterId ? null : encounterId)
  }

  const removeFriendship = async (otherBirdId: string, otherBirdName: string) => {
    if (!confirm(`确定要解除与 ${otherBirdName} 的好友关系吗？`)) {
      return
    }

    try {
      const res = await fetch('/api/friendships', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otherBirdId }),
      })

      if (res.ok) {
        // 刷新数据
        await fetchData()
      }
    } catch (error) {
      console.error('Failed to remove friendship:', error)
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
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-800">鸟友圈</h1>
            <button
              onClick={checkEncounters}
              disabled={checking}
              className="btn-primary flex items-center gap-2"
            >
              {checking ? (
                <>
                  <span className="animate-spin">🔄</span>
                  检查中...
                </>
              ) : (
                <>
                  <span>🔍</span>
                  寻找新朋友
                </>
              )}
            </button>
          </div>

          {encounters.length === 0 ? (
            <div className="card text-center py-12">
              <div className="text-4xl mb-4">🌍</div>
              <h2 className="text-lg font-medium text-gray-800 mb-2">
                还没有相遇记录
              </h2>
              <p className="text-gray-600 mb-4">
                你的鸟正在迁徙途中，点击上方按钮寻找附近的鸟友
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {encounters.map((encounter) => {
                const isMyBirdInitiator = encounter.birdId === myBirdId
                const myBird = isMyBirdInitiator ? encounter.bird : encounter.metBird
                const otherBird = isMyBirdInitiator ? encounter.metBird : encounter.bird
                const isExpanded = expandedConversation === encounter.id
                const hasConversation = encounter.conversation && encounter.conversation.messages?.length > 0

                return (
                  <div key={encounter.id} className="card">
                    <div className="flex items-start gap-4">
                      <div className="text-3xl">🤝</div>
                      <div className="flex-1">
                        {/* 相遇标题 */}
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-medium text-gray-800">
                            {myBird.name}
                          </span>
                          <span className="text-gray-400">与</span>
                          <span className="font-medium text-gray-800">
                            {otherBird.name}
                          </span>
                          <span className="text-gray-400">相遇了</span>
                        </div>

                        {/* 位置和天气 */}
                        <div className="text-sm text-gray-600 mb-2">
                          📍 {encounter.location}
                          {encounter.weather && ` · ${encounter.weather}`}
                        </div>

                        {/* 相遇故事 */}
                        {encounter.story && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">
                            {encounter.story}
                          </p>
                        )}

                        {/* 吸引度和关系强度 */}
                        <div className="flex items-center gap-4 mb-3">
                          {encounter.conversation && (
                            <div className="flex items-center gap-1 text-sm">
                              <span className="text-pink-500">💕</span>
                              <span className="text-gray-600">
                                吸引度: {Math.round(encounter.conversation.attractionScore)}
                              </span>
                            </div>
                          )}
                          {encounter.relationship && (
                            <div className="flex items-center gap-2 flex-1 max-w-xs">
                              <span className="text-sm text-gray-600">友谊值:</span>
                              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500"
                                  style={{ width: `${encounter.relationship.strength}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-primary-600">
                                {encounter.relationship.strength}
                              </span>
                            </div>
                          )}
                          {/* 解除好友按钮 */}
                          {encounter.relationship && (
                            <button
                              onClick={() => removeFriendship(otherBird.id, otherBird.name)}
                              className="text-xs text-gray-400 hover:text-red-500 transition-colors"
                              title="解除好友关系"
                            >
                              解除好友
                            </button>
                          )}
                        </div>

                        {/* 对话按钮 */}
                        {hasConversation && (
                          <button
                            onClick={() => toggleConversation(encounter.id)}
                            className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                          >
                            <span>{isExpanded ? '▼' : '▶'}</span>
                            查看对话 ({encounter.conversation!.messages.length} 条消息)
                            {encounter.conversation!.status === 'in_progress' && (
                              <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded">
                                对话中...
                              </span>
                            )}
                          </button>
                        )}

                        {/* 对话内容 */}
                        {isExpanded && hasConversation && (
                          <div className="mt-4 space-y-3 border-t pt-4">
                            {encounter.conversation!.messages.map((msg) => {
                              const isMyMessage = msg.speakerBirdId === myBirdId
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex ${isMyMessage ? 'justify-end' : 'justify-start'}`}
                                >
                                  <div
                                    className={`max-w-[80%] p-3 rounded-lg ${
                                      isMyMessage
                                        ? 'bg-primary-50 text-gray-800'
                                        : 'bg-gray-100 text-gray-800'
                                    }`}
                                  >
                                    <div className="text-xs text-gray-500 mb-1">
                                      {msg.speakerBird.name} ({msg.speakerBird.species.name})
                                    </div>
                                    <div className="text-sm">{msg.content}</div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        )}

                        {/* 时间 */}
                        <div className="text-xs text-gray-400 mt-3">
                          {new Date(encounter.encounteredAt).toLocaleDateString('zh-CN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
