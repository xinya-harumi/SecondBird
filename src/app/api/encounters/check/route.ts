import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BIRD_SPECIES, getBirdCurrentLocation } from '@/data/birds'
import { calculateAttraction, calculateDistance, shouldTriggerConversation } from '@/lib/attraction'
import { runConversation } from '@/lib/conversation'
import { getUserShades } from '@/lib/secondme'

// 天气选项
const WEATHER_OPTIONS = ['晴朗', '多云', '微风', '薄雾', '阳光明媚', '清爽']

// 场景描述模板
const SCENE_TEMPLATES = [
  '湖边水草丰茂，波光粼粼',
  '树林间阳光透过枝叶洒下斑驳的光影',
  '湿地中芦苇摇曳，偶尔传来鸟鸣',
  '草原上微风拂过，带来远方的气息',
  '山谷间云雾缭绕，宛如仙境',
]

export async function POST(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    // 1. 获取当前用户的鸟
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        bird: {
          include: { species: true },
        },
      },
    })

    if (!user || !user.bird) {
      return NextResponse.json({ error: 'Bird not found' }, { status: 404 })
    }

    const myBird = user.bird

    // 2. 更新当前鸟的位置
    const speciesData = BIRD_SPECIES.find(s => s.id === myBird.speciesId)
    if (speciesData) {
      const currentLocation = getBirdCurrentLocation(speciesData)
      await prisma.bird.update({
        where: { id: myBird.id },
        data: {
          currentLat: currentLocation.lat,
          currentLng: currentLocation.lng,
          currentLocation: currentLocation.location,
        },
      })
      myBird.currentLat = currentLocation.lat
      myBird.currentLng = currentLocation.lng
      myBird.currentLocation = currentLocation.location
    }

    // 3. 查找同一区域的其他鸟（距离在5度以内）
    const nearbyBirds = await prisma.bird.findMany({
      where: {
        id: { not: myBird.id },
      },
      include: {
        species: true,
        user: {
          select: {
            id: true,
            name: true,
            avatarUrl: true,
            accessToken: true,
            secondmeId: true,
          },
        },
      },
    })

    // 4. 获取当前用户的兴趣标签
    let myShades: string[] = []
    try {
      const shadesResult = await getUserShades(user.accessToken)
      if (shadesResult.code === 0 && shadesResult.data) {
        // API 返回格式: { shades: [...] } 或直接数组
        const shadesArray = Array.isArray(shadesResult.data)
          ? shadesResult.data
          : shadesResult.data.shades || []
        myShades = shadesArray.map((s: { name: string }) => s.name)
      }
    } catch (e) {
      console.error('Failed to get user shades:', e)
    }

    const newEncounters = []

    // 5. 对每只附近的鸟计算吸引度
    for (const otherBird of nearbyBirds) {
      // 计算距离
      const distance = calculateDistance(
        myBird.currentLat,
        myBird.currentLng,
        otherBird.currentLat,
        otherBird.currentLng
      )

      // 距离太远，跳过
      if (distance > 5) continue

      // 检查最近24小时内是否已经相遇过
      const recentEncounter = await prisma.encounter.findFirst({
        where: {
          OR: [
            { birdId: myBird.id, metBirdId: otherBird.id },
            { birdId: otherBird.id, metBirdId: myBird.id },
          ],
          encounteredAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      })

      if (recentEncounter) continue

      // 获取对方的兴趣标签
      let otherShades: string[] = []
      try {
        const shadesResult = await getUserShades(otherBird.user.accessToken)
        if (shadesResult.code === 0 && shadesResult.data) {
          // API 返回格式: { shades: [...] } 或直接数组
          const shadesArray = Array.isArray(shadesResult.data)
            ? shadesResult.data
            : shadesResult.data.shades || []
          otherShades = shadesArray.map((s: { name: string }) => s.name)
        }
      } catch (e) {
        console.error('Failed to get other user shades:', e)
      }

      // 计算吸引度
      const myPersonality = myBird.personality.split('、')
      const otherPersonality = otherBird.personality.split('、')

      const attraction = calculateAttraction(
        myShades,
        otherShades,
        myPersonality,
        otherPersonality,
        myBird.species.name,
        otherBird.species.name,
        distance
      )

      // 检查是否达到相遇条件
      if (!shouldTriggerConversation(attraction.score)) continue

      // 6. 创建相遇记录
      const weather = WEATHER_OPTIONS[Math.floor(Math.random() * WEATHER_OPTIONS.length)]
      const scene = SCENE_TEMPLATES[Math.floor(Math.random() * SCENE_TEMPLATES.length)]

      const encounter = await prisma.encounter.create({
        data: {
          birdId: myBird.id,
          metBirdId: otherBird.id,
          location: myBird.currentLocation,
          lat: myBird.currentLat,
          lng: myBird.currentLng,
          weather,
          scene,
        },
        include: {
          bird: { include: { species: true } },
          metBird: { include: { species: true } },
        },
      })

      // 7. 创建对话记录
      const conversation = await prisma.conversation.create({
        data: {
          encounterId: encounter.id,
          attractionScore: attraction.score,
          status: 'pending',
        },
      })

      // 8. 触发自动对话（异步执行）
      const myBirdWithUser = {
        ...myBird,
        species: myBird.species,
        user: {
          id: user.id,
          name: user.name || '',
          avatarUrl: user.avatarUrl || undefined,
          accessToken: user.accessToken,
          secondmeId: user.secondmeId,
        },
      }

      const otherBirdWithUser = {
        ...otherBird,
        species: otherBird.species,
        user: otherBird.user,
      }

      const activity = speciesData
        ? getBirdCurrentLocation(speciesData).activity
        : '休息'

      // 异步运行对话，不阻塞响应
      runConversation(
        conversation.id,
        myBirdWithUser,
        otherBirdWithUser,
        {
          location: myBird.currentLocation,
          activity,
          weather,
          scene,
        }
      ).catch(err => {
        console.error('Conversation failed:', err)
      })

      newEncounters.push({
        encounter,
        conversation,
        attraction,
      })
    }

    return NextResponse.json({
      message: `检查完成，发现 ${newEncounters.length} 个新相遇`,
      encounters: newEncounters,
    })

  } catch (error) {
    console.error('Check encounters error:', error)
    return NextResponse.json(
      { error: 'Failed to check encounters' },
      { status: 500 }
    )
  }
}
