import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const userId = request.cookies.get('userId')?.value

  if (!userId) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      bird: {
        include: {
          species: true,
        },
      },
    },
  })

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // 如果用户没有鸟类记录，清除 cookie 让用户重新登录
  if (!user.bird) {
    const response = NextResponse.json({ error: 'No bird found, please re-login' }, { status: 401 })
    response.cookies.delete('userId')
    return response
  }

  return NextResponse.json({
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl,
    bird: user.bird,
  })
}
