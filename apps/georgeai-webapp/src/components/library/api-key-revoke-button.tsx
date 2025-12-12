import { useRef } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { useLibraryActions } from './use-library-actions'

interface ApiKeyRevokeButtonProps {
  libraryId: string
  apiKey: { id: string; name: string }
}

export const ApiKeyRevokeButton = (props: ApiKeyRevokeButtonProps) => {
  const ref = useRef<HTMLDialogElement>(null)
  const { t } = useTranslation()
  const { libraryId, apiKey } = props

  const { revokeApiKey, isPending } = useLibraryActions(libraryId)

  return (
    <>
      <button type="button" className="btn btn-ghost btn-sm btn-error" onClick={() => ref.current?.showModal()}>
        <TrashIcon className="size-4" />
        {t('apiKeys.revoke')}
      </button>

      <dialog ref={ref} className="modal">
        <form method="dialog" className="modal-box">
          <h3 className="text-lg font-bold">{t('apiKeys.revokeDialogTitle')}</h3>
          <p className="py-4">{t('apiKeys.revokeConfirm', { name: apiKey.name })}</p>
          <div className="modal-action">
            <button type="button" className="btn btn-ghost" disabled={isPending} onClick={() => ref.current?.close()}>
              {t('actions.cancel')}
            </button>
            <button
              type="button"
              className="btn btn-error"
              disabled={isPending}
              onClick={() => {
                revokeApiKey(apiKey.id)
                ref.current?.close()
              }}
            >
              {isPending && <span className="loading mr-2 loading-sm loading-spinner" />}
              {t('apiKeys.revoke')}
            </button>
          </div>
        </form>
      </dialog>
    </>
  )
}
