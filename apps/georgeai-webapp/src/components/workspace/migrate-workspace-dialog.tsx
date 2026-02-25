import { twMerge } from 'tailwind-merge'

import { CurrentUserFragment } from '../../gql/graphql'
import { CheckIcon } from '../../icons/check-icon'
import { ExclamationIcon } from '../../icons/exclamation-icon'
import { RefreshIcon } from '../../icons/refresh-icon'
import { toastError } from '../georgeToaster'
import { useWorkspace } from './use-workspace'

interface MigrateWorkspaceDialogProps {
  user: CurrentUserFragment
  onClose: () => void
}

function MigrationStatusItem({
  label,
  version,
  targetVersion,
}: {
  label: string
  version: number | string
  targetVersion: number
}) {
  const isUpToDate = version === targetVersion

  return (
    <div className="flex items-center gap-2">
      {isUpToDate ? (
        <CheckIcon className="size-5 shrink-0 text-success" />
      ) : (
        <ExclamationIcon className="size-5 shrink-0 text-warning" />
      )}
      <span className="flex-1">{label}</span>
      <span className="text-sm text-base-content/60">
        {version !== targetVersion
          ? version === 'unknown'
            ? `? → ${targetVersion}`
            : `${version} → ${targetVersion}`
          : `v-${version}`}
      </span>
    </div>
  )
}

export function MigrateWorkspaceDialog({ user, onClose }: MigrateWorkspaceDialogProps) {
  const { migrateWorkspace, migrationStatus, currentWorkspace, isPending } = useWorkspace(user)

  const isLoaded = !!migrationStatus && !!currentWorkspace

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
        onClose()
      },
    })
  }

  const needsMigration =
    isLoaded && (migrationStatus?.storageVersion !== 1 || migrationStatus?.vectorStoreVersion !== 1)

  const Icon = needsMigration ? ExclamationIcon : CheckIcon
  const alertClass = needsMigration ? 'alert-warning' : 'alert-success'
  const title = needsMigration ? 'Migration Required' : 'Up to Date'
  const description = needsMigration
    ? 'This workspace needs to be updated to continue using all features. The migration updates file storage and search index to the latest formats.'
    : 'Your workspace is up to date with the latest version.'

  return (
    <dialog className="modal" open aria-label="Migrate Workspace">
      <div className="modal-box max-w-md">
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
                <p className="text-sm opacity-80">
                  Workspace &quot;{currentWorkspace?.name || 'no current workspace'}&quot;
                </p>
              </div>
            </div>

            {/* Description */}
            <p className="mb-6 text-sm">{description}</p>

            {/* Status checklist */}
            <div className="mb-6 space-y-3 rounded-lg bg-base-200 p-4">
              <MigrationStatusItem label="File Storage" version={migrationStatus.storageVersion} targetVersion={1} />
              <div className="divider my-0" />
              <MigrationStatusItem
                label="Search Index"
                version={migrationStatus.vectorStoreVersion}
                targetVersion={1}
              />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2">
              {isPending && <span className="loading loading-md loading-spinner" />}

              <button disabled={isPending} type="button" className="btn btn-ghost" onClick={onClose}>
                {needsMigration ? 'Later' : 'Close'}
              </button>
              {needsMigration && (
                <button
                  disabled={isPending}
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
      {!isPending && (
        <form method="dialog" className="modal-backdrop">
          <button aria-label="Close dialog" type="button">
            close
          </button>
        </form>
      )}
    </dialog>
  )
}
