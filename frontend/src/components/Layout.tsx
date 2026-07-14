import { NavLink, Outlet } from 'react-router-dom'
import { Package, ShoppingCart } from 'lucide-react'

export default function Layout() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${
      isActive
        ? 'bg-white/10 text-white font-medium'
        : 'text-gray-400 hover:text-white hover:bg-white/5'
    }`

  return (
    <div className="flex h-screen bg-gray-50">
      <aside className="w-56 bg-gray-900 flex flex-col flex-shrink-0">
        <div className="px-5 py-5 border-b border-white/10">
          <h1 className="text-white font-bold text-lg">迷你电商后台</h1>
        </div>
        <nav className="flex flex-col gap-1 px-3 py-4">
          <NavLink to="/products" className={linkClass}>
            <Package size={18} />
            商品管理
          </NavLink>
          <NavLink to="/orders" className={linkClass}>
            <ShoppingCart size={18} />
            订单管理
          </NavLink>
        </nav>
      </aside>
      <main className="flex-1 overflow-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}
