import { Link, useLocation } from 'react-router-dom'

export default function BottomTabBar() {
  const location = useLocation()

  const tabClass = (to) =>
    `flex-1 flex flex-col items-center justify-center gap-0.5 text-xs transition-colors ${
      location.pathname === to ? 'text-[#10b981] font-semibold' : 'text-gray-500'
    }`

  return (
    <nav className="md:hidden shrink-0 bg-white border-t border-gray-200 flex h-16">
      <Link to="/dashboard" className={tabClass('/dashboard')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
        Dashboard
      </Link>

      <Link to="/add" className="flex-1 flex flex-col items-center justify-center transition-colors">
        <span className={`flex items-center justify-center h-11 w-11 rounded-full ${location.pathname === '/add' ? 'bg-green-600' : 'bg-[#10b981]'}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
        </span>
      </Link>

      <Link to="/pantry" className={tabClass('/pantry')}>
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z" />
        </svg>
        Mi Despensa
      </Link>
    </nav>
  )
}
