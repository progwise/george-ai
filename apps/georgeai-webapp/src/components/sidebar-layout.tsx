import { Outlet } from '@tanstack/react-router'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../gql/graphql'
import { Sidebar } from './sidebar'
import TopNavigation from './top-navigation'

interface SidebarLayoutProps {
  user: UserFragment | null
  workspaceId: string | null
}

export function SidebarLayout({ user, workspaceId }: SidebarLayoutProps) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="drawer lg:drawer-open">
      <input
        id="sidebar"
        type="checkbox"
        className="drawer-toggle"
        checked={isDrawerOpen}
        onChange={(e) => setIsDrawerOpen(e.target.checked)}
      />
      <div
        className={twMerge(
          'drawer-content transition-all duration-250 ease-in',
          isDrawerOpen ? 'lg:pl-64' : 'lg:pl-14',
        )}
      >
        <TopNavigation user={user} workspaceId={workspaceId} isDrawerOpen={isDrawerOpen} />
        <div>
          <Outlet />
        </div>
      </div>
      {user && <Sidebar user={user} workspaceId={workspaceId} isDrawerOpen={isDrawerOpen} />}
    </div>
  )
}
