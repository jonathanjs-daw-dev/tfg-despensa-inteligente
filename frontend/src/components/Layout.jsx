import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'

export default function Layout({ children }) {
  const { user, closeSession } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  async function handleLogout() {
    await closeSession()
    navigate('/login')
  }

  const navLink = (to, label) => (
    <Link
      to={to}
      className={`block px-3 py-2 rounded-md text-sm transition-colors ${
        location.pathname === to
          ? 'font-semibold text-[#10b981] bg-green-50'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {label}
    </Link>
  )

  const bottomTabClass = (to) =>
    `flex-1 flex flex-col items-center justify-center py-2 text-xs gap-0.5 transition-colors ${
      location.pathname === to ? 'text-[#10b981] font-semibold' : 'text-gray-500'
    }`

  return (
    <div className="flex min-h-screen w-full">
      {/* ── Sidebar — solo desktop (md+) ── */}
      <aside className="hidden md:flex w-60 min-h-screen bg-[#f9fafb] border-r border-[#e5e7eb] flex-col p-4 shrink-0">
        <div className="mb-6">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 mb-1 hover:opacity-80 transition-opacity"
          >
            <img
              src="/apple-icon.png"
              alt="Logo Despensa Inteligente"
              className="h-8 w-8 rounded-md"
            />
            <p className="font-bold text-gray-900">Despensa Inteligente</p>
          </Link>
          <p className="text-sm text-gray-500 pl-10">{user?.name ?? ''}</p>
        </div>

        <nav className="space-y-1 flex-1">
          {navLink('/dashboard', 'Dashboard')}
          {navLink('/add', 'Añadir')}
          {navLink('/pantry', 'Mi Despensa')}
          {navLink('/shopping-list', 'Lista de la compra')}
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

      {/* ── Columna principal ── */}
      <div className="flex-1 flex flex-col min-h-screen min-w-0">
        {/* Top header — solo móvil */}
        <header className="md:hidden sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shrink-0">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <img
              src="/apple-icon.png"
              alt="Logo Despensa Inteligente"
              className="h-7 w-7 rounded-md"
            />
            <span className="font-semibold text-sm text-gray-900">Despensa Inteligente</span>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="text-gray-500 text-xs"
            onClick={handleLogout}
          >
            Salir
          </Button>
        </header>

        {/* Contenido de la página */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 pb-20 md:pb-6">{children}</main>

        {/* Bottom tab bar — solo móvil */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-white border-t border-gray-200 flex h-16">
          <Link to="/dashboard" className={bottomTabClass('/dashboard')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            Dashboard
          </Link>
          <Link to="/add" className={bottomTabClass('/add')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <rect
                x="3"
                y="3"
                width="18"
                height="18"
                rx="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v8M8 12h8" />
            </svg>
            Añadir
          </Link>
          <Link to="/pantry" className={bottomTabClass('/pantry')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"
              />
            </svg>
            Mi Despensa
          </Link>
          <Link to="/shopping-list" className={bottomTabClass('/shopping-list')}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.8}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"
              />
              <rect
                x="9"
                y="3"
                width="6"
                height="4"
                rx="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 16h4" />
            </svg>
            Compra
          </Link>
        </nav>
      </div>
    </div>
  )
}
