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
    },
    orderBy: { encounteredAt: 'desc' },
    take: 50,
  })

  return NextResponse.json({ encounters })
}
