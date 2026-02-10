import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { toastError } from '../../components/georgeToaster'
import { useWorkspace } from '../../components/workspace'
import { CheckIcon } from '../../icons/check-icon'
import { ExclamationIcon } from '../../icons/exclamation-icon'
import { RefreshIcon } from '../../icons/refresh-icon'

export const Route = createFileRoute('/_authenticated')({
  component: RouteComponent,
  beforeLoad: async ({ context, location }) => {
    if (!context.user) {
      throw redirect({
        to: '/login',
        search: { redirect: location.href },
      })
    }

    // make user in router context non nullable and add workspaceId
    return { user: context.user, workspaceId: context.workspaceId }
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { migrateWorkspace, migrationStatus, currentWorkspace, isPending } = useWorkspace(user)

  useEffect(() => {
    if (!migrationStatus) return
    if (migrationStatus.needsMigration && dialogRef.current?.open !== true) {
      dialogRef.current?.showModal()
    }
  }, [migrationStatus])

  const handleMigrateWorkspace = () => {
    if (!migrationStatus) {
      toastError('No migration status available.')
      return
    }
    if (isPending) {
      toastError('Migration is already in progress.')
      return
    }
    migrateWorkspace(undefined, {
      onSuccess: () => {
        window.location.reload()
        dialogRef.current?.close()
      },
    })
  }

  return (
    <>
      {currentWorkspace && migrationStatus?.needsMigration && (
        <dialog ref={dialogRef} className="modal" open aria-label="Migrate Workspace">
          <div className="modal-box max-w-md">
            {/* Header with icon */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/20">
                <ExclamationIcon className="size-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Setup Required</h3>
                <p className="text-sm text-base-content/70">{currentWorkspace.name}</p>
              </div>
            </div>

            {/* Simple explanation */}
            <p className="mb-4 text-base-content/80">
              This workspace needs a quick setup to work with the latest update.
            </p>

            {/* Status checklist */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                {migrationStatus.storageVersion === 1 ? (
                  <CheckIcon className="size-5 text-success" />
                ) : (
                  <ExclamationIcon className="size-5 text-warning" />
                )}
                <span className={migrationStatus.storageVersion ? 'text-base-content/70' : ''}>File Storage</span>
                {migrationStatus.storageVersion === 1 ? (
                  <span className="badge badge-sm badge-success">
                    Ready (Version {migrationStatus.storageVersion} )
                  </span>
                ) : (
                  <span className="badge badge-sm badge-warning">
                    Outdated (Version {migrationStatus.storageVersion})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {migrationStatus.vectorStoreVersion === 1 ? (
                  <CheckIcon className="size-5 text-success" />
                ) : (
                  <ExclamationIcon className="size-5 text-warning" />
                )}
                <span className={migrationStatus.vectorStoreVersion === 1 ? 'text-base-content/70' : ''}>
                  Search Index
                </span>
                {migrationStatus.vectorStoreVersion === 1 ? (
                  <span className="badge badge-sm badge-success">
                    Ready (Version {migrationStatus.vectorStoreVersion})
                  </span>
                ) : (
                  <span className="badge badge-sm badge-warning">
                    Outdated (Version {migrationStatus.vectorStoreVersion})
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2">
              {isPending && <span className="loading loading-xl loading-bars text-accent"></span>}

              <button
                disabled={isPending}
                type="button"
                className="btn btn-ghost"
                onClick={() => dialogRef.current?.close()}
              >
                Later
              </button>
              <button
                disabled={isPending}
                type="button"
                className="btn gap-2 btn-primary"
                onClick={() => {
                  handleMigrateWorkspace()
                }}
              >
                <RefreshIcon className="size-4" />
                Run Setup
              </button>
            </div>
          </div>
          {!isPending && (
            <form method="dialog" className="modal-backdrop">
              <button type="button">close</button>
            </form>
          )}
        </dialog>
      )}
      <Outlet />
    </>
  )
}
