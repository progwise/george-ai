import { useMemo } from 'react'

import { UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'
import { useWorkspace } from './use-workspace'

interface DeleteWorkspaceDialogProps {
  user: UserFragment
  ref: React.RefObject<HTMLDialogElement | null>
}

export const DeleteWorkspaceDialog = ({ user, ref }: DeleteWorkspaceDialogProps) => {
  const { t } = useTranslation()

  const { currentWorkspace, deleteWorkspace, setWorkspace, isPending, isLoading } = useWorkspace(user)

  const canDeleteWorkspace = useMemo(() => {
    if (!currentWorkspace) return false
    if (currentWorkspace.isDefault) return false
    if (currentWorkspace.librariesCount > 0) return false
    if (currentWorkspace.assistantsCount > 0) return false
    if (currentWorkspace.listsCount > 0) return false
    if (currentWorkspace.automationsCount > 0) return false
    return true
  }, [currentWorkspace])

  const validationMessage = useMemo(() => {
    if (!currentWorkspace) return ''
    if (currentWorkspace.isDefault) return t('workspace.deleteBlockedDefault')
    if (currentWorkspace.librariesCount > 0 || currentWorkspace.assistantsCount > 0) {
      return t('workspace.deleteBlockedItems', {
        count: currentWorkspace.librariesCount + currentWorkspace.assistantsCount,
      })
    }
    if (currentWorkspace.listsCount > 0) {
      return t('workspace.deleteBlockedLists', { count: currentWorkspace.listsCount })
    }
    if (currentWorkspace.automationsCount > 0) {
      return t('workspace.deleteBlockedAutomations', { count: currentWorkspace.automationsCount })
    }
    return ''
  }, [currentWorkspace, t])

  const handleSubmit = async () => {
    if (!currentWorkspace) return
    deleteWorkspace(undefined, {
      onSuccess: async () => {
        ref.current?.close()
        setWorkspace(user.defaultWorkspaceId)
      },
    })
  }

  if (!currentWorkspace) return null

  return (
    <DialogForm
      ref={ref}
      title={`${t('workspace.deleteTitle')}: ${currentWorkspace.name}`}
      description={canDeleteWorkspace ? t('workspace.deleteDescription') : t('workspace.deleteBlockedDescription')}
      onSubmit={handleSubmit}
      submitButtonText={t('workspace.deleteTitle')}
      disabledSubmit={isPending || isLoading}
      buttonOptions={canDeleteWorkspace ? 'cancelAndConfirm' : 'onlyClose'}
    >
      {/* Show item counts */}
      {!canDeleteWorkspace && (
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <div className="font-bold">{validationMessage}</div>
            <div className="text-sm">
              <ul className="mt-2 list-inside list-disc">
                {currentWorkspace.librariesCount > 0 && (
                  <li>
                    {currentWorkspace.librariesCount} {currentWorkspace.librariesCount === 1 ? 'library' : 'libraries'}
                  </li>
                )}
                {currentWorkspace.assistantsCount > 0 && (
                  <li>
                    {currentWorkspace.assistantsCount}{' '}
                    {currentWorkspace.assistantsCount === 1 ? 'assistant' : 'assistants'}
                  </li>
                )}
                {currentWorkspace.listsCount > 0 && (
                  <li>
                    {currentWorkspace.listsCount} {currentWorkspace.listsCount === 1 ? 'list' : 'lists'}
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Show warning if workspace can be deleted */}
      {canDeleteWorkspace && <div className="text-sm font-bold text-error">{t('workspace.deleteWarning')}</div>}

      {/* Show instructions if workspace cannot be deleted */}
      {!canDeleteWorkspace && <div className="text-sm text-base-content/70">{t('workspace.deleteInstructions')}</div>}
    </DialogForm>
  )
}
