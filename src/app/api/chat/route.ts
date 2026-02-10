import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { callSecondMeApi } from '@/lib/secondme'

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { bird: { include: { species: true } } },
  })

  if (!user || !user.bird) {
    return NextResponse.json({ error: 'User or bird not found' }, { status: 404 })
  }

  const { message, birdSpeciesName } = await request.json()

  // 构建系统提示词，让 AI 扮演鸟类
  const birdName = birdSpeciesName || user.bird.species.name
  const systemPrompt = `你是一只${birdName}，有着独特的性格：${user.bird.personality}。
你正在${user.bird.currentLocation}生活。
请用第一人称回答用户的问题，分享你作为候鸟的生活经历、迁徙故事和对世界的看法。
保持友好、有趣，偶尔可以用一些鸟类的视角来描述事物。
回答要简洁，不超过200字。`

  try {
    // 调用 SecondMe Chat API
    const response = await fetch(`${process.env.SECONDME_API_URL}/api/secondme/chat/stream`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${user.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        systemPrompt,
      }),
    })

    // 返回流式响应
    return new NextResponse(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error) {
    console.error('Chat error:', error)
    return NextResponse.json({ error: 'Chat failed' }, { status: 500 })
  }
}
