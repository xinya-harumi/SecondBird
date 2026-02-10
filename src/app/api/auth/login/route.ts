import { NextResponse } from 'next/server'
import { getAuthorizationUrl } from '@/lib/secondme'

export async function GET() {
  const authUrl = getAuthorizationUrl()
  return NextResponse.redirect(authUrl)
}
