'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavbarProps {
  user: {
    name: string
    avatarUrl: string
  }
}

export default function Navbar({ user }: NavbarProps) {
  const pathname = usePathname()

  const navItems = [
    { href: '/', label: '世界地图' },
    { href: '/my-bird', label: '我的鸟' },
    { href: '/friends', label: '鸟友圈' },
    { href: '/encyclopedia', label: '鸟类百科' },
    { href: '/chat', label: 'AI 对话' },
  ]

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span className="text-2xl">🐦</span>
          <span className="text-xl font-bold text-gray-800">SecondBird 鸟友会</span>
        </Link>

        {/* 导航链接 */}
        <nav className="flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href ? 'nav-link-active' : ''}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 用户信息 */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">{user.name}</span>
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="w-8 h-8 rounded-full"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-600 text-sm font-medium">
                {user.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
          <a
            href="/api/auth/logout"
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            退出
          </a>
        </div>
      </div>
    </header>
  )
}
