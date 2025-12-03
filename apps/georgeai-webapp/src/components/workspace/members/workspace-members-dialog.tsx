import { RefObject } from 'react'

import { UserFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { WorkspaceMembersPanel } from './workspace-members-panel'

interface WorkspaceMembersDialogProps {
  user: UserFragment
  ref: RefObject<HTMLDialogElement | null>
}

export const WorkspaceMembersDialog = ({ user, ref }: WorkspaceMembersDialogProps) => {
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

        <WorkspaceMembersPanel user={user} onLeaveSuccess={handleClose} />
      </div>
      <form method="dialog" className="modal-backdrop">
        <button type="submit" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
