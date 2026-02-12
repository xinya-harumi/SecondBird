import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取相遇记录
export async function GET(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userBird = await prisma.bird.findUnique({
    where: { userId },
  })

  if (!userBird) {
    return NextResponse.json({ error: 'Bird not found' }, { status: 404 })
  }

  const encounters = await prisma.encounter.findMany({
    where: {
      OR: [
        { birdId: userBird.id },
        { metBirdId: userBird.id },
      ],
    },
    include: {
      bird: {
        include: {
          species: true,
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
      metBird: {
        include: {
          species: true,
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
      conversation: {
        include: {
          messages: {
            include: {
              speakerBird: {
                include: { species: true },
              },
            },
            orderBy: { round: 'asc' },
          },
        },
      },
    },
    orderBy: { encounteredAt: 'desc' },
    take: 50,
  })

  // 获取用户的关系列表
  const relationships = await prisma.birdRelationship.findMany({
    where: {
      birdId: userBird.id,
    },
    include: {
      relatedBird: {
        include: {
          species: true,
          user: {
            select: { name: true, avatarUrl: true },
          },
        },
      },
    },
  })

  // 构建关系映射
  const relationshipMap = new Map(
    relationships.map(r => [r.relatedBirdId, { type: r.type, strength: r.strength }])
  )

  // 为每个相遇添加关系信息
  const encountersWithRelationship = encounters.map(encounter => {
    const otherBirdId = encounter.birdId === userBird.id ? encounter.metBirdId : encounter.birdId
    const relationship = relationshipMap.get(otherBirdId)

    return {
      ...encounter,
      relationship: relationship || null,
    }
  })

  return NextResponse.json({
    encounters: encountersWithRelationship,
    myBirdId: userBird.id,
  })
}
