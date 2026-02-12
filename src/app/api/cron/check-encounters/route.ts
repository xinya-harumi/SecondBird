import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { BIRD_SPECIES, getBirdCurrentLocation, canBirdsEncounter } from '@/data/birds'
import { calculateAttraction, calculateDistance, shouldTriggerConversation } from '@/lib/attraction'
import { runConversation } from '@/lib/conversation'

// 定时任务：检查所有鸟的相遇
export async function GET(request: NextRequest) {
  // 简单的 API Key 认证
  const authHeader = request.headers.get('authorization')
  const apiKey = process.env.CRON_API_KEY

  if (apiKey && authHeader !== `Bearer ${apiKey}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // 1. 获取所有鸟及其用户信息
    const allBirds = await prisma.bird.findMany({
      include: {
        species: true,
        user: true,
      },
    })

    if (allBirds.length < 2) {
      return NextResponse.json({
        message: '鸟类数量不足，无法检查相遇',
        birdCount: allBirds.length,
      })
    }

    // 2. 更新所有鸟的位置（根据当前月份）
    const currentMonth = new Date().getMonth() + 1
    for (const bird of allBirds) {
      const speciesData = BIRD_SPECIES.find(s => s.id === bird.speciesId)
      if (speciesData) {
        const location = getBirdCurrentLocation(speciesData, currentMonth)
        await prisma.bird.update({
          where: { id: bird.id },
          data: {
            currentLat: location.lat,
            currentLng: location.lng,
            currentLocation: location.location,
          },
        })
        // 更新内存中的数据
        bird.currentLat = location.lat
        bird.currentLng = location.lng
        bird.currentLocation = location.location
      }
    }

    // 3. 两两检查相遇
    const newEncounters: any[] = []
    const checkedPairs = new Set<string>()

    for (let i = 0; i < allBirds.length; i++) {
      for (let j = i + 1; j < allBirds.length; j++) {
        const bird1 = allBirds[i]
        const bird2 = allBirds[j]

        // 避免重复检查
        const pairKey = [bird1.id, bird2.id].sort().join('-')
        if (checkedPairs.has(pairKey)) continue
        checkedPairs.add(pairKey)

        // 检查是否在同一地点
        const location1 = { lat: bird1.currentLat, lng: bird1.currentLng, location: bird1.currentLocation, month: currentMonth, activity: '' }
        const location2 = { lat: bird2.currentLat, lng: bird2.currentLng, location: bird2.currentLocation, month: currentMonth, activity: '' }

        if (!canBirdsEncounter(location1, location2)) continue

        // 检查是否已经相遇过（24小时内）
        const recentEncounter = await prisma.encounter.findFirst({
          where: {
            OR: [
              { birdId: bird1.id, metBirdId: bird2.id },
              { birdId: bird2.id, metBirdId: bird1.id },
            ],
            encounteredAt: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
            },
          },
        })

        if (recentEncounter) continue

        // 计算距离
        const distance = calculateDistance(
          bird1.currentLat,
          bird1.currentLng,
          bird2.currentLat,
          bird2.currentLng
        )

        // 从 preferences 中提取 shades，从 personality 中提取性格
        const bird1Shades = extractShades(bird1.preferences)
        const bird2Shades = extractShades(bird2.preferences)
        const bird1Personality = bird1.personality.split('、')
        const bird2Personality = bird2.personality.split('、')

        // 计算吸引度
        const attraction = calculateAttraction(
          bird1Shades,
          bird2Shades,
          bird1Personality,
          bird2Personality,
          bird1.species.name,
          bird2.species.name,
          distance
        )

        // 检查是否应该触发对话
        if (!shouldTriggerConversation(attraction.score)) continue

        // 创建相遇记录
        const encounter = await prisma.encounter.create({
          data: {
            birdId: bird1.id,
            metBirdId: bird2.id,
            location: bird1.currentLocation,
            lat: bird1.currentLat,
            lng: bird1.currentLng,
            weather: getRandomWeather(),
            scene: getRandomScene(bird1.currentLocation),
          },
        })

        // 创建对话记录
        const conversation = await prisma.conversation.create({
          data: {
            encounterId: encounter.id,
            attractionScore: attraction.score,
            status: 'pending',
          },
        })

        // 获取物种数据
        const species1Data = BIRD_SPECIES.find(s => s.id === bird1.speciesId)
        const activity = species1Data ? getBirdCurrentLocation(species1Data).activity : '休息'

        // 准备带用户信息的鸟数据
        const bird1WithUser = {
          ...bird1,
          species: bird1.species,
          user: bird1.user,
        }
        const bird2WithUser = {
          ...bird2,
          species: bird2.species,
          user: bird2.user,
        }

        // 异步运行对话
        runConversation(
          conversation.id,
          bird1WithUser as any,
          bird2WithUser as any,
          {
            location: bird1.currentLocation,
            activity,
            weather: encounter.weather || undefined,
            scene: encounter.scene || undefined,
          }
        ).catch(err => {
          console.error('Cron conversation failed:', err)
        })

        newEncounters.push({
          bird1: bird1.name,
          bird2: bird2.name,
          location: bird1.currentLocation,
          attractionScore: attraction.score,
        })
      }
    }

    return NextResponse.json({
      success: true,
      message: `定时检查完成，发现 ${newEncounters.length} 个新相遇`,
      encounters: newEncounters,
      totalBirds: allBirds.length,
      checkedPairs: checkedPairs.size,
    })

  } catch (error) {
    console.error('Cron check encounters error:', error)
    return NextResponse.json(
      { error: 'Failed to check encounters' },
      { status: 500 }
    )
  }
}

// 随机天气
function getRandomWeather(): string {
  const weathers = ['晴朗', '多云', '微风', '薄雾', '阳光明媚']
  return weathers[Math.floor(Math.random() * weathers.length)]
}

// 根据地点生成场景
function getRandomScene(location: string): string {
  if (location.includes('湖') || location.includes('海')) {
    const scenes = ['波光粼粼的水面', '芦苇丛边', '浅滩上', '清澈的湖畔']
    return scenes[Math.floor(Math.random() * scenes.length)]
  }
  if (location.includes('草') || location.includes('原')) {
    const scenes = ['广阔的草原上', '青青草地间', '野花丛中']
    return scenes[Math.floor(Math.random() * scenes.length)]
  }
  const scenes = ['宁静的角落', '温暖的阳光下', '微风轻拂中']
  return scenes[Math.floor(Math.random() * scenes.length)]
}

// 从 preferences JSON 中提取 shades/traits
function extractShades(preferences: string): string[] {
  try {
    const parsed = JSON.parse(preferences)
    return parsed.traits || parsed.shades || []
  } catch {
    return []
  }
}
