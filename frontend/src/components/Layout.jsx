import { useState } from 'react'
import Sidebar from '@/components/Sidebar'
import AppHeader from '@/components/AppHeader'
import BottomTabBar from '@/components/BottomTabBar'
import MobileDrawer from '@/components/MobileDrawer'

export default function Layout({ children }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <div className="flex h-dvh overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col min-w-0 min-h-0">
        <AppHeader onMenuClick={() => setDrawerOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-5xl mx-auto">{children}</div>
        </main>

        <BottomTabBar />
      </div>

      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </div>
  )
}
