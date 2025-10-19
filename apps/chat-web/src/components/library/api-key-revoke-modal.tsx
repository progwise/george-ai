import { RefObject } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { useLibraryActions } from './use-library-actions'

interface ApiKeyRevokeModalProps {
  ref: RefObject<HTMLDialogElement | null>
  libraryId: string
  apiKey: { id: string; name: string }
}

export const ApiKeyRevokeModal = (props: ApiKeyRevokeModalProps) => {
  const { t } = useTranslation()
  const { ref, libraryId, apiKey } = props

  const { revokeApiKey, isPending } = useLibraryActions(libraryId)

  return (
    <dialog ref={ref} className="modal">
      <form method="dialog" className="modal-box">
        <h3 className="text-lg font-bold">{t('apiKeys.revokeKey')}</h3>
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
            {isPending && <span className="loading loading-spinner loading-sm mr-2" />}
            {t('apiKeys.revoke')}
          </button>
        </div>
      </form>
    </dialog>
  )
}
