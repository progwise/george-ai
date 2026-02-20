import { Outlet } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../../gql/graphql'
import { NewAutomationDialog } from '../automations/new-automation-dialog'
import { NewLibraryDialog } from '../library/new-library-dialog'
import { NewListDialog } from '../lists/new-list-dialog'
import TopNavigation from '../top-navigation'
import { Sidebar } from './sidebar'

interface SidebarLayoutProps {
  user: UserFragment | null
  workspaceId: string | null
}

export function SidebarLayout({ user, workspaceId }: SidebarLayoutProps) {
  const newLibraryDialogRef = useRef<HTMLDialogElement | null>(null)
  const newListDialogRef = useRef<HTMLDialogElement | null>(null)
  const newAutomationDialogRef = useRef<HTMLDialogElement | null>(null)
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
      {user && (
        <>
          <Sidebar
            user={user}
            workspaceId={workspaceId}
            isDrawerOpen={isDrawerOpen}
            newLibraryDialogRef={newLibraryDialogRef}
            newListDialogRef={newListDialogRef}
            newAutomationDialogRef={newAutomationDialogRef}
          />

          <NewLibraryDialog ref={newLibraryDialogRef} />
          <NewListDialog ref={newListDialogRef} />
          <NewAutomationDialog ref={newAutomationDialogRef} />
        </>
      )}
    </div>
  )
}
