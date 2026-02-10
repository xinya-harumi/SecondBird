import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BIRD_SPECIES, getBirdCurrentLocation } from '@/data/birds'

// 获取所有鸟的位置（用于地图显示）
export async function GET(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // 获取当前用户的鸟
  const userBird = await prisma.bird.findUnique({
    where: { userId },
    include: {
      species: true,
      relationships: {
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
      },
    },
  })

  if (!userBird) {
    return NextResponse.json({ error: 'Bird not found' }, { status: 404 })
  }

  // 更新鸟的当前位置（根据当前月份）
  const speciesData = BIRD_SPECIES.find(s => s.id === userBird.speciesId)
  if (speciesData) {
    const currentLocation = getBirdCurrentLocation(speciesData)
    await prisma.bird.update({
      where: { id: userBird.id },
      data: {
        currentLat: currentLocation.lat,
        currentLng: currentLocation.lng,
        currentLocation: currentLocation.location,
      },
    })
    userBird.currentLat = currentLocation.lat
    userBird.currentLng = currentLocation.lng
    userBird.currentLocation = currentLocation.location
  }

  // 获取好友的鸟
  const friendships = await prisma.friendship.findMany({
    where: { userId },
    include: {
      friend: {
        include: {
          bird: {
            include: {
              species: true,
            },
          },
        },
      },
    },
  })

  // 更新好友鸟的位置
  const friendBirds = await Promise.all(
    friendships.map(async (f) => {
      if (!f.friend.bird) return null
      const friendSpecies = BIRD_SPECIES.find(s => s.id === f.friend.bird!.speciesId)
      if (friendSpecies) {
        const location = getBirdCurrentLocation(friendSpecies)
        await prisma.bird.update({
          where: { id: f.friend.bird!.id },
          data: {
            currentLat: location.lat,
            currentLng: location.lng,
            currentLocation: location.location,
          },
        })
        return {
          ...f.friend.bird,
          currentLat: location.lat,
          currentLng: location.lng,
          currentLocation: location.location,
          userName: f.friend.name,
          userAvatar: f.friend.avatarUrl,
        }
      }
      return {
        ...f.friend.bird,
        userName: f.friend.name,
        userAvatar: f.friend.avatarUrl,
      }
    })
  )

  return NextResponse.json({
    myBird: {
      ...userBird,
      speciesEmoji: speciesData?.imageEmoji || '🐦',
      activity: speciesData ? getBirdCurrentLocation(speciesData).activity : '',
    },
    friendBirds: friendBirds.filter(Boolean).map(b => ({
      ...b,
      speciesEmoji: BIRD_SPECIES.find(s => s.id === b?.speciesId)?.imageEmoji || '🐦',
    })),
  })
}
