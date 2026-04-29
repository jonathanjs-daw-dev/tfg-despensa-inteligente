import { useEffect } from 'react'
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

export default function MobileDrawer({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, closeSession } = useAuth()

  // Cierra al navegar
  useEffect(() => {
    onClose()
  }, [location.pathname])

  // Cierra con Escape
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  async function handleLogout() {
    onClose()
    await closeSession()
    navigate('/login')
  }

  return (
    <>
      {/* Backdrop — cubre header y tab bar */}
      <div
        className={`md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 ${
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-4/5 max-w-xs bg-white flex flex-col p-4 shadow-xl transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img src="/apple-icon.png" alt="Logo" className="h-8 w-8 rounded-md" />
            <p className="font-bold text-gray-900">Despensa Inteligente</p>
          </Link>
        </div>

        <nav className="space-y-1 flex-1">
          {NAV_LINKS.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`block px-3 py-2.5 rounded-md text-sm transition-colors ${
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
      </div>
    </>
  )
}
