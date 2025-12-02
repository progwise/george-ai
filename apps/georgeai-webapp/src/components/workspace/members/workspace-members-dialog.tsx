import { RefObject } from 'react'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { WorkspaceMembersPanel } from './workspace-members-panel'

interface WorkspaceMembersDialogProps {
  ref: RefObject<HTMLDialogElement | null>
  workspaceId: string
  workspaceName: string
  onLeaveSuccess?: () => void
}

export const WorkspaceMembersDialog = ({
  ref,
  workspaceId,
  workspaceName,
  onLeaveSuccess,
}: WorkspaceMembersDialogProps) => {
  const { t } = useTranslation()

  const handleClose = () => {
    ref.current?.close()
  }

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box max-w-2xl">
        <form method="dialog">
          <button
            type="submit"
            className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            aria-label={t('actions.close')}
          >
            ✕
          </button>
        </form>

        <h3 className="mb-4 text-lg font-bold">
          {t('workspace.members.title')}: {workspaceName}
        </h3>

        <WorkspaceMembersPanel workspaceId={workspaceId} onLeaveSuccess={onLeaveSuccess} />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
