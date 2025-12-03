import { useEffect, useState } from 'react'

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
  const [validation, setValidation] = useState<{
    canDelete: boolean
    message: string
    libraryCount: number
    assistantCount: number
    listCount: number
  } | null>(null)

  const { currentWorkspace, workspaces, validateWorkspaceDeletion, deleteWorkspace, setWorkspace, isPending } =
    useWorkspace(user)

  // Validate deletion when dialog opens
  useEffect(() => {
    if (!currentWorkspace?.id) return

    const timeoutId = setTimeout(() => {
      setValidation(null)
      validateWorkspaceDeletion(currentWorkspace.id, {
        onSuccess: (result) => {
          setValidation(result)
        },
      })
    }, 0)

    return () => clearTimeout(timeoutId)
  }, [currentWorkspace?.id, validateWorkspaceDeletion])

  const handleSubmit = () => {
    if (!validation?.canDelete || !currentWorkspace) return

    deleteWorkspace(currentWorkspace.id, {
      onSuccess: async () => {
        ref.current?.close()
        // Switch to another workspace if available
        const otherWorkspace = workspaces.find((w) => w.id !== currentWorkspace.id)
        if (otherWorkspace) {
          await setWorkspace(otherWorkspace.id)
        }
      },
    })
  }

  if (!currentWorkspace) return null

  return (
    <DialogForm
      ref={ref}
      title={`${t('workspace.deleteTitle')}: ${currentWorkspace.name}`}
      description={validation?.canDelete ? t('workspace.deleteDescription') : t('workspace.deleteBlockedDescription')}
      onSubmit={handleSubmit}
      submitButtonText={t('workspace.delete')}
      disabledSubmit={isPending || !validation?.canDelete}
      buttonOptions={validation?.canDelete ? 'cancelAndConfirm' : 'onlyClose'}
    >
      {/* Show item counts */}
      {validation && (
        <div className="alert alert-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
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
            <div className="font-bold">{validation.message}</div>
            {!validation?.canDelete && (
              <div className="text-sm">
                <ul className="mt-2 list-inside list-disc">
                  {validation.libraryCount > 0 && (
                    <li>
                      {validation.libraryCount} {validation.libraryCount === 1 ? 'library' : 'libraries'}
                    </li>
                  )}
                  {validation.assistantCount > 0 && (
                    <li>
                      {validation.assistantCount} {validation.assistantCount === 1 ? 'assistant' : 'assistants'}
                    </li>
                  )}
                  {validation.listCount > 0 && (
                    <li>
                      {validation.listCount} {validation.listCount === 1 ? 'list' : 'lists'}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Show warning if workspace can be deleted */}
      {validation?.canDelete && <div className="text-error text-sm font-bold">{t('workspace.deleteWarning')}</div>}

      {/* Show instructions if workspace cannot be deleted */}
      {!validation?.canDelete && (
        <div className="text-base-content/70 text-sm">{t('workspace.deleteInstructions')}</div>
      )}
    </DialogForm>
  )
}
