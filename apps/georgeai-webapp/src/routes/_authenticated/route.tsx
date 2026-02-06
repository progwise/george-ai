import { useSuspenseQuery } from '@tanstack/react-query'
import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { useEffect, useRef } from 'react'

import { toastError } from '../../components/georgeToaster'
import { useWorkspace } from '../../components/workspace'
import { getWorkspaceNeedsMigrationQueryOptions } from '../../components/workspace/queries'
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
  loader: async ({ context }) => {
    await context.queryClient.ensureQueryData(getWorkspaceNeedsMigrationQueryOptions())
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const dialogRef = useRef<HTMLDialogElement>(null)

  const { migrateWorkspace, isPending } = useWorkspace(user)
  const { data } = useSuspenseQuery(getWorkspaceNeedsMigrationQueryOptions())

  useEffect(() => {
    if (data?.needsMigration && dialogRef.current?.open !== true) {
      dialogRef.current?.showModal()
    }
  }, [data])

  const handleMigrateWorkspace = () => {
    if (!data?.id) {
      toastError('Workspace ID is missing.')
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
      {data?.needsMigration && (
        <dialog ref={dialogRef} className="modal" open aria-label="Migrate Workspace">
          <div className="modal-box max-w-md">
            {/* Header with icon */}
            <div className="mb-4 flex items-center gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-warning/20">
                <ExclamationIcon className="size-6 text-warning" />
              </div>
              <div>
                <h3 className="text-lg font-bold">Setup Required</h3>
                <p className="text-sm text-base-content/70">{data?.name}</p>
              </div>
            </div>

            {/* Simple explanation */}
            <p className="mb-4 text-base-content/80">
              This workspace needs a quick setup to work with the latest update.
            </p>

            {/* Status checklist */}
            <div className="mb-6 space-y-2">
              <div className="flex items-center gap-2">
                {data?.hasWorkspaceStorage ? (
                  <CheckIcon className="size-5 text-success" />
                ) : (
                  <ExclamationIcon className="size-5 text-warning" />
                )}
                <span className={data?.hasWorkspaceStorage ? 'text-base-content/70' : ''}>File Storage</span>
                {data?.hasWorkspaceStorage && <span className="badge badge-sm badge-success">Ready</span>}
              </div>
              <div className="flex items-center gap-2">
                {data?.hasVectorStore ? (
                  <CheckIcon className="size-5 text-success" />
                ) : (
                  <ExclamationIcon className="size-5 text-warning" />
                )}
                <span className={data?.hasVectorStore ? 'text-base-content/70' : ''}>Search Index</span>
                {data?.hasVectorStore && <span className="badge badge-sm badge-success">Ready</span>}
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
