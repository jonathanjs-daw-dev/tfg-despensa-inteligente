import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/add', label: 'Añadir' },
  { to: '/pantry', label: 'Mi Despensa' },
  { to: '/shopping-list', label: 'Lista de la compra' },
  { to: '/recipes', label: 'Recetas IA' },
]

export default function Sidebar() {
  const { user, closeSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await closeSession()
    navigate('/login')
  }

  return (
    <aside className="hidden md:flex w-60 shrink-0 flex-col bg-[#f9fafb] border-r border-[#e5e7eb] p-4">
      <div className="mb-6">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 mb-1 hover:opacity-80 transition-opacity"
        >
          <img src="/apple-icon.png" alt="Logo" className="h-8 w-8 rounded-md" />
          <p className="font-bold text-gray-900">Despensa Inteligente</p>
        </Link>
        <p className="text-sm text-gray-500 pl-10">{user?.name ?? ''}</p>
      </div>

      <nav className="space-y-1 flex-1">
        {NAV_LINKS.map(({ to, label }) => (
          <Link
            key={to}
            to={to}
            className={`block px-3 py-2 rounded-md text-sm transition-colors ${
              location.pathname === to
                ? 'font-semibold text-[#10b981] bg-green-50'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="mt-auto pt-4 border-t border-[#e5e7eb]">
        <div className="flex items-center gap-2 mb-3">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs bg-green-100 text-green-800">
              {user?.name?.charAt(0).toUpperCase() ?? '?'}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm text-gray-700 truncate">{user?.name ?? ''}</span>
        </div>
        <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
          Salir
        </Button>
      </div>
    </aside>
  )
}
