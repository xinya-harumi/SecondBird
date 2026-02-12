// SecondMe API 配置
export const SECONDME_CONFIG = {
  clientId: process.env.SECONDME_CLIENT_ID!,
  clientSecret: process.env.SECONDME_CLIENT_SECRET!,
  redirectUri: process.env.SECONDME_REDIRECT_URI!,
  authUrl: process.env.SECONDME_AUTH_URL || 'https://go.second.me/oauth/',
  apiUrl: process.env.SECONDME_API_URL || 'https://app.mindos.com/gate/lab',
  scopes: ['user.info', 'user.info.shades', 'user.info.softmemory', 'note.add', 'chat'],
}

import { prisma } from '@/lib/prisma'

/**
 * 获取有效的 AccessToken，如果过期则自动刷新
 */
export async function getValidAccessToken(userId: string): Promise<string> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new Error('User not found')
  }

  // 检查 token 是否即将过期（提前 5 分钟刷新）
  const now = new Date()
  const expiresAt = new Date(user.tokenExpiresAt)
  const bufferTime = 5 * 60 * 1000 // 5 分钟

  if (expiresAt.getTime() - now.getTime() > bufferTime) {
    // Token 还有效
    return user.accessToken
  }

  // Token 即将过期，刷新
  console.log(`Refreshing token for user ${userId}`)
  try {
    const tokenData = await refreshAccessToken(user.refreshToken)

    const newAccessToken = tokenData.access_token || tokenData.accessToken
    const newRefreshToken = tokenData.refresh_token || tokenData.refreshToken || user.refreshToken
    const expiresIn = tokenData.expires_in || tokenData.expiresIn || 7200

    // 更新数据库
    await prisma.user.update({
      where: { id: userId },
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        tokenExpiresAt: new Date(Date.now() + expiresIn * 1000),
      },
    })

    return newAccessToken
  } catch (error) {
    console.error('Failed to refresh token:', error)
    // 刷新失败，返回旧 token（可能仍然有效）
    return user.accessToken
  }
}

// 生成授权 URL
export function getAuthorizationUrl(): string {
  const params = new URLSearchParams({
    client_id: SECONDME_CONFIG.clientId,
    redirect_uri: SECONDME_CONFIG.redirectUri,
    response_type: 'code',
    scope: SECONDME_CONFIG.scopes.join(' '),
  })
  return `${SECONDME_CONFIG.authUrl}?${params.toString()}`
}

// 用授权码换取 Token
export async function exchangeCodeForToken(code: string) {
  // OAuth token 端点
  const tokenUrl = `${SECONDME_CONFIG.apiUrl}/api/oauth/token/code`
  console.log('Exchanging code for token at:', tokenUrl)

  // 使用 x-www-form-urlencoded 格式
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: SECONDME_CONFIG.clientId,
    client_secret: SECONDME_CONFIG.clientSecret,
    code,
    redirect_uri: SECONDME_CONFIG.redirectUri,
  })

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const result = await response.json()
  console.log('Token exchange response:', JSON.stringify(result))

  if (result.code !== 0) {
    throw new Error(result.message || `Token exchange failed: ${JSON.stringify(result)}`)
  }
  return result.data
}

// 刷新 Token
export async function refreshAccessToken(refreshToken: string) {
  const params = new URLSearchParams({
    grant_type: 'refresh_token',
    client_id: SECONDME_CONFIG.clientId,
    client_secret: SECONDME_CONFIG.clientSecret,
    refresh_token: refreshToken,
  })

  const response = await fetch(`${SECONDME_CONFIG.apiUrl}/api/oauth/token/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  const result = await response.json()
  if (result.code !== 0) {
    throw new Error(result.message || 'Failed to refresh token')
  }
  return result.data
}

// 调用 SecondMe API
export async function callSecondMeApi(endpoint: string, accessToken: string, options?: RequestInit) {
  const url = `${SECONDME_CONFIG.apiUrl}${endpoint}`
  console.log('Calling SecondMe API:', url)

  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  })

  const result = await response.json()
  console.log('SecondMe API response for', endpoint, ':', JSON.stringify(result))
  return result
}

// 获取用户信息
export async function getUserInfo(accessToken: string) {
  return callSecondMeApi('/api/secondme/user/info', accessToken)
}

// 获取用户兴趣标签
export async function getUserShades(accessToken: string) {
  return callSecondMeApi('/api/secondme/user/shades', accessToken)
}

// 获取用户软记忆
export async function getUserSoftMemory(accessToken: string) {
  return callSecondMeApi('/api/secondme/user/softmemory', accessToken)
}

// 发送聊天消息（非流式，用于后台任务）
export async function sendChatMessage(
  accessToken: string,
  message: string,
  context?: string
): Promise<string> {
  const result = await callSecondMeApi('/api/secondme/chat', accessToken, {
    method: 'POST',
    body: JSON.stringify({
      message,
      context,
      stream: false,
    }),
  })

  if (result.code !== 0) {
    throw new Error(result.message || 'Chat API failed')
  }

  return result.data?.response || result.data?.message || ''
}

// 流式聊天（用于实时展示）
export async function streamChat(
  accessToken: string,
  message: string,
  context?: string,
  onChunk?: (chunk: string) => void
): Promise<string> {
  const url = `${SECONDME_CONFIG.apiUrl}/api/secondme/chat`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'text/event-stream',
    },
    body: JSON.stringify({
      message,
      context,
      stream: true,
    }),
  })

  if (!response.ok) {
    throw new Error(`Chat API failed: ${response.status}`)
  }

  // 处理 SSE 流
  const reader = response.body?.getReader()
  const decoder = new TextDecoder()
  let fullResponse = ''

  if (reader) {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      fullResponse += chunk
      onChunk?.(chunk)
    }
  }

  return fullResponse
}
