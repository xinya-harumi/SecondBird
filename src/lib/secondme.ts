// SecondMe API 配置
export const SECONDME_CONFIG = {
  clientId: process.env.SECONDME_CLIENT_ID!,
  clientSecret: process.env.SECONDME_CLIENT_SECRET!,
  redirectUri: process.env.SECONDME_REDIRECT_URI!,
  authUrl: process.env.SECONDME_AUTH_URL || 'https://go.second.me/oauth/',
  apiUrl: process.env.SECONDME_API_URL || 'https://app.mindos.com/gate/lab',
  scopes: ['user.info', 'user.info.shades', 'user.info.softmemory', 'note.add', 'chat'],
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
