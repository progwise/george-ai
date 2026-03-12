import { Outlet } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { CurrentUserFragment } from '../../gql/graphql'
import { NewAutomationDialog } from '../automations/new-automation-dialog'
import { NewLibraryDialog } from '../library/new-library-dialog'
import { NewListDialog } from '../lists/new-list-dialog'
import TopNavigation from '../top-navigation'
import { CreateWorkspaceDialog } from '../workspace/create-workspace-dialog'
import { DeleteWorkspaceDialog } from '../workspace/delete-workspace-dialog'
import { Sidebar } from './sidebar'

interface SidebarLayoutProps {
  user: CurrentUserFragment | null
}

export function SidebarLayout({ user }: SidebarLayoutProps) {
  const newLibraryDialogRef = useRef<HTMLDialogElement | null>(null)
  const newListDialogRef = useRef<HTMLDialogElement | null>(null)
  const newAutomationDialogRef = useRef<HTMLDialogElement | null>(null)
  const createWorkspaceRef = useRef<HTMLDialogElement>(null)
  const deleteWorkspaceDialogRef = useRef<HTMLDialogElement>(null)

  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  return (
    <div className="drawer md:drawer-open">
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
          isDrawerOpen ? 'md:pl-64' : 'md:pl-14',
        )}
      >
        <TopNavigation user={user} isDrawerOpen={isDrawerOpen} setIsDrawerOpen={setIsDrawerOpen} />
        <div role="main">
          <Outlet />
        </div>
      </div>
      {user && (
        <>
          <Sidebar
            user={user}
            isDrawerOpen={isDrawerOpen}
            newLibraryDialogRef={newLibraryDialogRef}
            newListDialogRef={newListDialogRef}
            newAutomationDialogRef={newAutomationDialogRef}
            createWorkspaceDialogRef={createWorkspaceRef}
            deleteWorkspaceDialogRef={deleteWorkspaceDialogRef}
          />

          <NewLibraryDialog ref={newLibraryDialogRef} />
          <NewListDialog ref={newListDialogRef} />
          <NewAutomationDialog ref={newAutomationDialogRef} />
          <CreateWorkspaceDialog user={user} dialogRef={createWorkspaceRef} />
          <DeleteWorkspaceDialog user={user} ref={deleteWorkspaceDialogRef} />
        </>
      )}
    </div>
  )
}
