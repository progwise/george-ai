import { twMerge } from 'tailwind-merge'

import { CurrentUserFragment } from '../../gql/graphql'
import { CheckIcon } from '../../icons/check-icon'
import { ExclamationIcon } from '../../icons/exclamation-icon'
import { LibraryIcon } from '../../icons/library-icon'
import { RefreshIcon } from '../../icons/refresh-icon'
import { UsersIcon } from '../../icons/users-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { useWorkspaceMigration } from './use-workspace-migration'

interface MigrateWorkspaceDialogProps {
  user: CurrentUserFragment
  onClose: () => void
}

function MigrationStatusItem({
  type,
  label,
  status,
  isLoading,
  migrate,
}: {
  type: 'workspace' | 'library'
  label: string
  status: string
  isLoading: boolean
  migrate: () => void
}) {
  const isUpToDate = status === 'ok'

  return (
    <div className="flex items-center gap-2">
      {isLoading ? (
        <span className="loading loading-xs loading-spinner"></span>
      ) : type === 'workspace' ? (
        <UsersIcon className={twMerge('size-5 shrink-0', isUpToDate ? 'text-success' : 'text-error')} />
      ) : (
        <LibraryIcon className={twMerge('size-5 shrink-0', isUpToDate ? 'text-success' : 'text-warning')} />
      )}
      <span className="flex-1">{label}</span>
      <span className="text-sm text-base-content/60">{status}</span>
      {isLoading ? (
        <span className="loading loading-xs loading-spinner"></span>
      ) : isUpToDate ? (
        <button type="button" className="btn btn-ghost btn-sm" title="This item is up to date." disabled>
          <CheckIcon className="size-5 shrink-0 text-success" />
        </button>
      ) : (
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          title="This item requires migration to be up to date."
          onClick={migrate}
        >
          <ExclamationIcon className="size-4 shrink-0 text-warning" />
        </button>
      )}
    </div>
  )
}

export function MigrateWorkspaceDialog({ onClose }: MigrateWorkspaceDialogProps) {
  const {
    invalidateStatus,
    workspace,
    workspaceStatus,
    workspaceStatusIsLoading,
    librariesStatus,
    librariesIsLoading,
    migrateLibrary,
    migrateWorkspace,
    isMigrating,
  } = useWorkspaceMigration()

  const isLoaded = !workspaceStatusIsLoading && !!workspace

  const handleMigrateWorkspace = () => {
    if (!workspace) {
      toastError('Workspace not set.')
      return
    }
    if (isMigrating) {
      toastError('Migration is already in progress.')
      return
    }
    if (workspaceStatus.status === 'ok') {
      toastError('No migration needed.')
      return
    }

    migrateWorkspace({ workspaceId: workspace.id })
  }

  const handleMigrateLibrary = (libraryStatus: { id: string; status: 'ok' | string }) => {
    if (!workspace) {
      toastError('Workspace not set.')
      return
    }
    if (isMigrating) {
      toastError('Migration is already in progress.')
      return
    }
    if (libraryStatus.status === 'ok') {
      toastError('No migration needed.')
      return
    }

    migrateLibrary({ workspaceId: workspace.id, libraryId: libraryStatus.id }, {})
  }

  const needsMigration =
    (isLoaded && workspaceStatus.status !== 'ok') || librariesStatus.some((lib) => lib.status !== 'ok')

  const Icon = needsMigration ? ExclamationIcon : CheckIcon
  const alertClass = needsMigration ? 'alert-warning' : 'alert-success'
  const title = needsMigration ? 'Migration Required' : 'Up to Date'
  const description = needsMigration
    ? 'This workspace needs to be updated to continue using all features. The migration updates file storage and search index to the latest formats.'
    : 'Your workspace is up to date with the latest version.'

  return (
    <dialog className="modal" open aria-label="Migrate Workspace">
      <div className="modal-box max-w-2xl">
        {!isLoaded ? (
          <>
            {/* Skeleton: Header */}
            <div className="mb-4 flex items-center gap-3">
              <div className="size-12 shrink-0 skeleton rounded-full" />
              <div className="flex-1 space-y-2">
                <div className="h-5 w-36 skeleton" />
                <div className="h-4 w-24 skeleton" />
              </div>
            </div>

            {/* Skeleton: Description */}
            <div className="mb-4 h-4 w-full skeleton" />

            {/* Skeleton: Status checklist */}
            <div className="mb-6 space-y-3 rounded-lg bg-base-200 p-4">
              <div className="flex items-center gap-2">
                <div className="size-5 skeleton rounded-full" />
                <div className="h-4 w-24 skeleton" />
                <div className="h-4 w-10 skeleton" />
              </div>
              <div className="divider my-0" />
              <div className="flex items-center gap-2">
                <div className="size-5 skeleton rounded-full" />
                <div className="h-4 w-24 skeleton" />
                <div className="h-4 w-10 skeleton" />
              </div>
            </div>

            {/* Skeleton: Actions */}
            <div className="flex justify-end gap-2">
              <div className="h-10 w-20 skeleton rounded-lg" />
              <div className="h-10 w-28 skeleton rounded-lg" />
            </div>
          </>
        ) : (
          <>
            {/* Header */}
            <div className={twMerge('mb-4 alert', alertClass)}>
              <Icon className="size-6 shrink-0" />
              <div className="flex-1">
                <h3 className="text-base font-bold">{title}</h3>
                <p className="text-sm opacity-80">Workspace &quot;{workspace?.name || 'no current workspace'}&quot;</p>
              </div>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm">{description}</p>

            {/* Status checklist */}
            <div className="mb-6 space-y-3 rounded-lg bg-base-200 p-4">
              <>
                <MigrationStatusItem
                  type="workspace"
                  key={workspaceStatus.id}
                  label={workspaceStatus.label}
                  isLoading={workspaceStatus.isLoading}
                  status={workspaceStatus.status}
                  migrate={handleMigrateWorkspace}
                />
              </>
              {librariesIsLoading && <span className="loading loading-sm loading-spinner" />}
              {librariesStatus.map((libraryStatus) => (
                <MigrationStatusItem
                  type="library"
                  key={libraryStatus.id}
                  label={libraryStatus.label}
                  isLoading={libraryStatus.isLoading}
                  status={libraryStatus.status}
                  migrate={() => handleMigrateLibrary(libraryStatus)}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              {isMigrating && <span className="loading loading-md loading-spinner" />}

              <button disabled={isMigrating} type="button" className="btn btn-ghost" onClick={onClose}>
                {needsMigration ? 'Later' : 'Close'}
              </button>
              {needsMigration && (
                <button
                  disabled={isMigrating}
                  type="button"
                  className="btn gap-2 btn-primary"
                  onClick={handleMigrateWorkspace}
                >
                  <RefreshIcon className="size-4" />
                  Migrate Now
                </button>
              )}
            </div>
          </>
        )}
      </div>
      {!isMigrating && (
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close dialog" type="button">
            close
          </button>
        </form>
      )}
    </dialog>
  )
}
