import { Link, useLocation } from 'react-router-dom'
import { House, Plus, Package } from 'lucide-react'

export default function BottomTabBar() {
  const location = useLocation()

  const tabClass = (to) =>
    `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
      location.pathname === to ? 'text-[#10b981] font-semibold' : 'text-gray-500'
    }`

  return (
    <nav className="md:hidden shrink-0 bg-white border-t border-gray-200 flex h-16">
      <Link to="/dashboard" className={tabClass('/dashboard')}>
        <House className="h-5 w-5" />
        Dashboard
      </Link>

      <Link to="/add" className="flex-1 flex flex-col items-center justify-center transition-colors">
        <span className={`flex items-center justify-center h-11 w-11 rounded-full ${location.pathname === '/add' ? 'bg-green-600' : 'bg-[#10b981]'}`}>
          <Plus className="h-6 w-6 text-white" />
        </span>
      </Link>

      <Link to="/pantry" className={tabClass('/pantry')}>
        <Package className="h-5 w-5" />
        Mi Despensa
      </Link>
    </nav>
  )
}
