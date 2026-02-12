import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 删除好友关系
export async function DELETE(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { otherBirdId } = await request.json()

    if (!otherBirdId) {
      return NextResponse.json({ error: 'Missing otherBirdId' }, { status: 400 })
    }

    // 获取当前用户的鸟
    const myBird = await prisma.bird.findUnique({
      where: { userId },
    })

    if (!myBird) {
      return NextResponse.json({ error: 'Bird not found' }, { status: 404 })
    }

    // 删除双向好友关系
    await prisma.birdRelationship.deleteMany({
      where: {
        OR: [
          { birdId: myBird.id, relatedBirdId: otherBirdId },
          { birdId: otherBirdId, relatedBirdId: myBird.id },
        ],
      },
    })

    // 可选：删除相关的相遇记录和对话
    // 这里保留相遇记录，只删除关系

    return NextResponse.json({
      success: true,
      message: '已解除好友关系',
    })

  } catch (error) {
    console.error('Delete friendship error:', error)
    return NextResponse.json(
      { error: 'Failed to delete friendship' },
      { status: 500 }
    )
  }
}
