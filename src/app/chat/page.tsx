'use client'

import { useEffect, useState, useRef } from 'react'
import Navbar from '@/components/Navbar'
import { BIRD_SPECIES } from '@/data/birds'

interface UserData {
  id: string
  name: string
  avatarUrl: string
  bird: {
    name: string
    species: { name: string }
  }
}

interface Message {
  role: 'user' | 'assistant'
  content: string
}

export default function ChatPage() {
  const [user, setUser] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [selectedBird, setSelectedBird] = useState<string>('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUser()
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const fetchUser = async () => {
    try {
      const res = await fetch('/api/user')
      if (res.ok) {
        const data = await res.json()
        setUser(data)
        setSelectedBird(data.bird.species.name)
      } else {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendMessage = async () => {
    if (!input.trim() || sending) return

    const userMessage = input.trim()
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }])
    setSending(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          birdSpeciesName: selectedBird,
        }),
      })

      if (!res.ok) {
        throw new Error('Chat failed')
      }

      // 处理流式响应
      const reader = res.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''

      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (reader) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              const content = parsed.choices?.[0]?.delta?.content || ''
              assistantMessage += content
              setMessages((prev) => {
                const newMessages = [...prev]
                newMessages[newMessages.length - 1] = {
                  role: 'assistant',
                  content: assistantMessage,
                }
                return newMessages
              })
            } catch {
              // 忽略解析错误
            }
          }
        }
      }

      // 如果没有收到流式响应，显示默认消息
      if (!assistantMessage) {
        const birdData = BIRD_SPECIES.find(b => b.name === selectedBird)
        assistantMessage = `你好！我是一只${selectedBird}。${birdData?.description || ''} 有什么想问我的吗？`
        setMessages((prev) => {
          const newMessages = [...prev]
          newMessages[newMessages.length - 1] = {
            role: 'assistant',
            content: assistantMessage,
          }
          return newMessages
        })
      }
    } catch (error) {
      console.error('Chat error:', error)
      setMessages((prev) => [
        ...prev.slice(0, -1),
        {
          role: 'assistant',
          content: '抱歉，我现在有点累了，稍后再聊吧。',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  const currentBirdData = BIRD_SPECIES.find(b => b.name === selectedBird)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar user={user} />
      <main className="flex-1 flex">
        {/* 左侧鸟类选择 */}
        <aside className="w-64 bg-white border-r border-gray-200 p-4 overflow-y-auto">
          <h2 className="font-medium text-gray-800 mb-4">选择对话的鸟</h2>
          <div className="space-y-2">
            {BIRD_SPECIES.map((bird) => (
              <button
                key={bird.id}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedBird === bird.name
                    ? 'bg-primary-50 text-primary-700'
                    : 'hover:bg-gray-50 text-gray-700'
                }`}
                onClick={() => {
                  setSelectedBird(bird.name)
                  setMessages([])
                }}
              >
                <div className="flex items-center gap-2">
                  <span className="text-xl">{bird.imageEmoji}</span>
                  <span className="text-sm">{bird.name}</span>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* 右侧聊天区域 */}
        <div className="flex-1 flex flex-col">
          {/* 聊天头部 */}
          <div className="bg-white border-b border-gray-200 p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{currentBirdData?.imageEmoji || '🐦'}</span>
              <div>
                <h2 className="font-medium text-gray-800">{selectedBird}</h2>
                <p className="text-sm text-gray-500">
                  {currentBirdData?.englishName}
                </p>
              </div>
            </div>
          </div>

          {/* 消息列表 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-4xl mb-4">{currentBirdData?.imageEmoji || '🐦'}</div>
                <p>开始和{selectedBird}聊天吧！</p>
                <p className="text-sm mt-2">
                  问问它的迁徙故事、生活习性，或者任何你好奇的事情
                </p>
              </div>
            )}

            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] p-3 rounded-2xl ${
                    msg.role === 'user'
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {msg.content || (
                    <span className="inline-block animate-pulse">...</span>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* 输入框 */}
          <div className="bg-white border-t border-gray-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder={`和${selectedBird}说点什么...`}
                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-primary-300"
                disabled={sending}
              />
              <button
                onClick={sendMessage}
                disabled={sending || !input.trim()}
                className="btn-primary disabled:opacity-50"
              >
                发送
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
