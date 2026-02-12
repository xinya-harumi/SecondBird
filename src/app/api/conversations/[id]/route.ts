import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { id } = await params

    // 获取对话详情
    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        messages: {
          include: {
            speakerBird: {
              include: {
                species: true,
                user: {
                  select: { name: true, avatarUrl: true },
                },
              },
            },
          },
          orderBy: { round: 'asc' },
        },
        encounter: {
          include: {
            bird: {
              include: {
                species: true,
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
            metBird: {
              include: {
                species: true,
                user: {
                  select: { id: true, name: true, avatarUrl: true },
                },
              },
            },
          },
        },
      },
    })

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 })
    }

    // 检查用户是否有权限查看（必须是相遇的参与者之一）
    const userBird = await prisma.bird.findUnique({
      where: { userId },
    })

    if (!userBird) {
      return NextResponse.json({ error: 'Bird not found' }, { status: 404 })
    }

    const isParticipant =
      conversation.encounter.birdId === userBird.id ||
      conversation.encounter.metBirdId === userBird.id

    if (!isParticipant) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
    }

    return NextResponse.json({ conversation })

  } catch (error) {
    console.error('Get conversation error:', error)
    return NextResponse.json(
      { error: 'Failed to get conversation' },
      { status: 500 }
    )
  }
}
