import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 清理所有鸟类记录（仅用于测试）
export async function POST() {
  try {
    // 先删除依赖 Bird 的记录
    await prisma.message.deleteMany({})
    await prisma.conversation.deleteMany({})
    await prisma.encounter.deleteMany({})
    await prisma.birdRelationship.deleteMany({})
    await prisma.bird.deleteMany({})

    return NextResponse.json({
      success: true,
      message: '已清理所有鸟类记录，用户重新登录将分配新鸟类',
    })
  } catch (error) {
    console.error('Reset birds error:', error)
    return NextResponse.json(
      { error: 'Failed to reset birds' },
      { status: 500 }
    )
  }
}
