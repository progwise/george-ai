import { useQuery } from '@tanstack/react-query'
import { useRef } from 'react'

import { CurrentUserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { PlusIcon } from '../../icons/plus-icon'
import { ClientDate } from '../client-date'
import { getWorkspaceApiKeysQueryOptions } from '../workspace/queries'
import { ApiKeyGenerationModal } from './api-key-generation-modal'
import { ApiKeyRevokeButton } from './api-key-revoke-button'

interface ApiKeysCardProperties {
  user: CurrentUserFragment
}

export const ApiKeysCard = ({ user }: ApiKeysCardProperties) => {
  const { t } = useTranslation()

  const createDialogRef = useRef<HTMLDialogElement>(null)

  const {
    data: apiKeys,
    isLoading,
    isError,
    error,
  } = useQuery(getWorkspaceApiKeysQueryOptions({ workspaceId: user.selectedWorkspaceId }))

  if (isLoading) {
    return (
      <div className="skeleton p-8 text-center text-base-content/60">
        <p>{t('loading')}...</p>
      </div>
    )
  }

  if (isError || error || !apiKeys) {
    return (
      <div className="rounded-lg border-2 border-error p-8 text-center text-error">
        <pre>{JSON.stringify(error, null, 2)}</pre>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <button type="button" className="btn btn-sm btn-primary" onClick={() => createDialogRef.current?.showModal()}>
            <PlusIcon className="size-4" />
            {t('apiKeys.generate')}
          </button>
        </div>

        <p className="text-sm text-base-content/70">{t('apiKeys.description')}</p>

        {apiKeys.length === 0 ? (
          <div className="rounded-lg border-2 border-dashed p-8 text-center text-base-content/60">
            <p>{t('apiKeys.noKeys')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table table-zebra">
              <thead>
                <tr>
                  <th>{t('apiKeys.name')}</th>
                  <th>{t('apiKeys.createdAt')}</th>
                  <th>{t('apiKeys.lastUsedAt')}</th>
                  <th>{t('apiKeys.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr key={key.id}>
                    <td className="font-medium">{key.name}</td>
                    <td className="text-sm">
                      <ClientDate date={key.createdAt} />
                    </td>
                    <td className="text-sm">
                      <ClientDate date={key.lastUsedAt} fallback={t('apiKeys.never')} />
                    </td>
                    <td className="text-sm">
                      <ApiKeyRevokeButton apiKey={key} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ApiKeyGenerationModal ref={createDialogRef} />
    </>
  )
}
