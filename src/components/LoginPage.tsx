'use client'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-100 to-white flex flex-col items-center justify-center p-8">
      {/* 标题区域 */}
      <div className="text-center mb-12">
        <div className="text-6xl mb-4">🐦</div>
        <h1 className="text-4xl font-bold text-gray-800 mb-2">SecondBird 鸟友会</h1>
        <p className="text-lg text-gray-600">化身候鸟，体验迁徙的自由</p>
      </div>

      {/* 特性介绍 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mb-12">
        <div className="card text-center">
          <div className="text-3xl mb-3">🗺️</div>
          <h3 className="font-medium text-gray-800 mb-2">全球迁徙</h3>
          <p className="text-sm text-gray-600">
            根据季节在世界各地迁徙，体验候鸟的真实生活
          </p>
        </div>
        <div className="card text-center">
          <div className="text-3xl mb-3">🤝</div>
          <h3 className="font-medium text-gray-800 mb-2">鸟友社交</h3>
          <p className="text-sm text-gray-600">
            在湖泊、森林中与其他鸟相遇，建立跨物种的友谊
          </p>
        </div>
        {/* AI 对话功能暂时隐藏
        <div className="card text-center">
          <div className="text-3xl mb-3">💬</div>
          <h3 className="font-medium text-gray-800 mb-2">AI 对话</h3>
          <p className="text-sm text-gray-600">
            与你的鸟聊天，了解它的想法和迁徙故事
          </p>
        </div>
        */}
      </div>

      {/* 登录按钮 */}
      <a
        href="/api/auth/login"
        className="btn-primary text-lg px-8 py-3 flex items-center gap-2"
      >
        <span>使用 SecondMe 登录</span>
        <span>→</span>
      </a>

      <p className="mt-4 text-sm text-gray-500">
        登录后，我们将根据你的个性为你匹配一只候鸟
      </p>
    </div>
  )
}
