import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { ClientSidebar } from './ClientSidebar'
import { ClientTopbar } from './ClientTopbar'

export default function ClientShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <ClientSidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <ClientTopbar />
        <main className="flex-1 overflow-auto p-6 scrollbar-thin">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
