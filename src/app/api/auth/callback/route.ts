import { NextRequest, NextResponse } from 'next/server'
import { exchangeCodeForToken, getUserInfo, getUserShades } from '@/lib/secondme'
import { prisma } from '@/lib/prisma'
import { BIRD_SPECIES, matchBirdByPersonality, getBirdCurrentLocation } from '@/data/birds'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/?error=no_code', request.url))
  }

  try {
    // 1. 用授权码换取 Token
    const tokenData = await exchangeCodeForToken(code)
    console.log('Token data received:', JSON.stringify(tokenData))

    // 检查 token 数据结构，可能是 access_token 或 accessToken
    const access_token = tokenData.access_token || tokenData.accessToken
    const refresh_token = tokenData.refresh_token || tokenData.refreshToken
    const expires_in = tokenData.expires_in || tokenData.expiresIn || 7200

    console.log('Access token:', access_token?.substring(0, 20) + '...')

    // 2. 获取用户信息
    const userInfoResult = await getUserInfo(access_token)
    console.log('User info result:', JSON.stringify(userInfoResult))
    if (userInfoResult.code !== 0) {
      throw new Error(`Failed to get user info: ${JSON.stringify(userInfoResult)}`)
    }
    const userInfo = userInfoResult.data

    // 3. 获取用户兴趣标签（用于匹配鸟类）
    const shadesResult = await getUserShades(access_token)
    const shades = shadesResult.code === 0 ? shadesResult.data?.shades || [] : []
    const userTraits = shades.map((s: { name: string }) => s.name)

    // 4. 计算 Token 过期时间
    const tokenExpiresAt = new Date(Date.now() + expires_in * 1000)

    // 5. 创建或更新用户
    const user = await prisma.user.upsert({
      where: { secondmeId: userInfo.route || userInfo.email },
      update: {
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
      },
      create: {
        secondmeId: userInfo.route || userInfo.email,
        email: userInfo.email,
        name: userInfo.name,
        avatarUrl: userInfo.avatarUrl,
        accessToken: access_token,
        refreshToken: refresh_token,
        tokenExpiresAt,
      },
    })

    // 6. 检查用户是否已有鸟，如果没有则创建
    const existingBird = await prisma.bird.findUnique({
      where: { userId: user.id },
    })

    if (!existingBird) {
      // 匹配鸟类
      const matchedSpecies = matchBirdByPersonality(userTraits)

      // 确保物种存在于数据库
      await prisma.birdSpecies.upsert({
        where: { name: matchedSpecies.name },
        update: {},
        create: {
          id: matchedSpecies.id,
          name: matchedSpecies.name,
          englishName: matchedSpecies.englishName,
          scientificName: matchedSpecies.scientificName,
          description: matchedSpecies.description,
          habitat: matchedSpecies.habitat,
          migrationRoute: JSON.stringify(matchedSpecies.migrationRoute),
        },
      })

      // 获取当前位置
      const currentLocation = getBirdCurrentLocation(matchedSpecies)

      // 创建鸟
      await prisma.bird.create({
        data: {
          userId: user.id,
          speciesId: matchedSpecies.id,
          name: `${user.name || '小'}的${matchedSpecies.name}`,
          personality: matchedSpecies.personality.join('、'),
          preferences: JSON.stringify({ traits: userTraits }),
          currentLat: currentLocation.lat,
          currentLng: currentLocation.lng,
          currentLocation: currentLocation.location,
        },
      })
    }

    // 7. 设置 Cookie 并重定向
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 天
    })

    return response
  } catch (error: any) {
    console.error('OAuth callback error:', error?.message || error)
    // 返回更详细的错误信息用于调试
    const errorMessage = encodeURIComponent(error?.message || 'unknown_error')
    return NextResponse.redirect(new URL(`/?error=auth_failed&detail=${errorMessage}`, request.url))
  }
}
