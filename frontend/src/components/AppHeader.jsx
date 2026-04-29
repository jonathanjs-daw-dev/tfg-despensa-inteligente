import { usePageHeaderGetter } from '@/context/PageHeaderContext'

export default function AppHeader({ onMenuClick }) {
  const { title, actions } = usePageHeaderGetter()

  return (
    <header className="shrink-0 bg-white border-b border-gray-200 px-4 h-14 flex items-center gap-3">
      <button
        className="md:hidden p-1.5 -ml-1 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
        onClick={onMenuClick}
        aria-label="Abrir menú"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <h1 className="flex-1 text-base font-semibold text-gray-900 truncate">{title}</h1>

      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  )
}
