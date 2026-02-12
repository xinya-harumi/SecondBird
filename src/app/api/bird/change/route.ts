import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BIRD_SPECIES, getBirdCurrentLocation } from '@/data/birds'

// 获取可选的鸟类列表
export async function GET() {
  const birds = BIRD_SPECIES.map(bird => ({
    id: bird.id,
    name: bird.name,
    englishName: bird.englishName,
    description: bird.description,
    personality: bird.personality,
    imageEmoji: bird.imageEmoji,
  }))

  return NextResponse.json({ birds })
}

// 切换鸟类
export async function POST(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { speciesId } = await request.json()

    if (!speciesId) {
      return NextResponse.json({ error: 'Missing speciesId' }, { status: 400 })
    }

    // 检查物种是否存在
    const speciesData = BIRD_SPECIES.find(s => s.id === speciesId)
    if (!speciesData) {
      return NextResponse.json({ error: 'Invalid species' }, { status: 400 })
    }

    // 获取用户
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { bird: true },
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 确保物种存在于数据库
    await prisma.birdSpecies.upsert({
      where: { name: speciesData.name },
      update: {},
      create: {
        id: speciesData.id,
        name: speciesData.name,
        englishName: speciesData.englishName,
        scientificName: speciesData.scientificName,
        description: speciesData.description,
        habitat: speciesData.habitat,
        migrationRoute: JSON.stringify(speciesData.migrationRoute),
      },
    })

    // 获取新位置
    const currentLocation = getBirdCurrentLocation(speciesData)

    if (user.bird) {
      // 清空相遇记录、对话、好友关系
      // 删除相遇记录（会级联删除对话和消息）
      await prisma.encounter.deleteMany({
        where: {
          OR: [
            { birdId: user.bird.id },
            { metBirdId: user.bird.id },
          ],
        },
      })

      // 删除鸟类关系
      await prisma.birdRelationship.deleteMany({
        where: {
          OR: [
            { birdId: user.bird.id },
            { relatedBirdId: user.bird.id },
          ],
        },
      })

      // 删除好友关系
      await prisma.friendship.deleteMany({
        where: {
          OR: [
            { userId: user.id },
            { friendId: user.id },
          ],
        },
      })

      // 更新现有鸟类
      await prisma.bird.update({
        where: { id: user.bird.id },
        data: {
          speciesId: speciesData.id,
          name: `${user.name || '小'}的${speciesData.name}`,
          personality: speciesData.personality.join('、'),
          currentLat: currentLocation.lat,
          currentLng: currentLocation.lng,
          currentLocation: currentLocation.location,
        },
      })
    } else {
      // 创建新鸟类
      await prisma.bird.create({
        data: {
          userId: user.id,
          speciesId: speciesData.id,
          name: `${user.name || '小'}的${speciesData.name}`,
          personality: speciesData.personality.join('、'),
          preferences: JSON.stringify({ traits: [] }),
          currentLat: currentLocation.lat,
          currentLng: currentLocation.lng,
          currentLocation: currentLocation.location,
        },
      })
    }

    return NextResponse.json({
      success: true,
      message: `已切换为${speciesData.name}`,
    })

  } catch (error) {
    console.error('Change bird error:', error)
    return NextResponse.json(
      { error: 'Failed to change bird' },
      { status: 500 }
    )
  }
}
