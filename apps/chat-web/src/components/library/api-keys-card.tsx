import { useSuspenseQuery } from '@tanstack/react-query'
import { useRef, useState } from 'react'

import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { TrashIcon } from '../../icons/trash-icon'
import { ApiKeyGenerationModal } from './api-key-generation-modal'
import { ApiKeyRevokeModal } from './api-key-revoke-modal'
import { getApiKeysQueryOptions } from './queries/get-api-keys'

export interface ApiKeysCardProps {
  libraryId: string
}

export const ApiKeysCard = ({ libraryId }: ApiKeysCardProps) => {
  const { t } = useTranslation()
  const [selectedApiKey, setSelectedApiKey] = useState<{ id: string; name: string } | null>(null)
  const createDialogRef = useRef<HTMLDialogElement>(null)
  const revokeApiKeyDialogRef = useRef<HTMLDialogElement>(null)

  const { data: apiKeys } = useSuspenseQuery(getApiKeysQueryOptions(libraryId))

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString()
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button type="button" className="btn btn-primary btn-sm" onClick={() => createDialogRef.current?.showModal()}>
            <PlusIcon className="h-4 w-4" />
            {t('apiKeys.generate')}
          </button>
        </div>

        <p className="text-base-content/70 text-sm">{t('apiKeys.description')}</p>

        {apiKeys.length === 0 ? (
          <div className="text-base-content/60 rounded-lg border-2 border-dashed p-8 text-center">
            <p>{t('apiKeys.noKeys')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table-zebra table">
              <thead>
                <tr>
                  <th>{t('apiKeys.name')}</th>
                  <th>{t('apiKeys.createdAt')}</th>
                  <th>{t('apiKeys.lastUsedAt')}</th>
                  <th className="text-right">{t('apiKeys.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="font-medium">{key.name}</td>
                    <td className="text-sm">{formatDate(key.createdAt)}</td>
                    <td className="text-sm">{key.lastUsedAt ? formatDate(key.lastUsedAt) : t('apiKeys.never')}</td>
                    <td className="text-right">
                      <button
                        type="button"
                        className="btn btn-error btn-ghost btn-sm"
                        onClick={() => {
                          setSelectedApiKey({ id: key.id, name: key.name })
                          revokeApiKeyDialogRef.current?.showModal()
                        }}
                      >
                        <TrashIcon className="h-4 w-4" />
                        {t('apiKeys.revoke')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ApiKeyGenerationModal ref={createDialogRef} libraryId={libraryId} />
      {selectedApiKey && (
        <ApiKeyRevokeModal ref={revokeApiKeyDialogRef} libraryId={libraryId} apiKey={selectedApiKey} />
      )}
    </>
  )
}
