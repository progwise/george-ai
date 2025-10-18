import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RefObject, useState } from 'react'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { Language, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CopyIcon } from '../../icons/copy-icon'
import { Input } from '../form/input'
import { toastError, toastSuccess } from '../georgeToaster'
import { getApiKeysQueryOptions } from './queries/get-api-keys'
import { generateApiKeyFn } from './server-functions/generate-api-key'

export interface ApiKeyGenerationModalProps {
  ref: RefObject<HTMLDialogElement | null>
  libraryId: string
}

const getApiKeyFormSchema = (language: Language) =>
  z.object({
    name: z
      .string()
      .min(2, translate('apiKeys.validation.nameTooShort', language))
      .max(100, translate('apiKeys.validation.nameTooLong', language)),
  })

export const ApiKeyGenerationModal = ({ ref, libraryId }: ApiKeyGenerationModalProps) => {
  const { t, language } = useTranslation()
  const queryClient = useQueryClient()
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [keyName, setKeyName] = useState<string>('')

  const schema = getApiKeyFormSchema(language)

  const generateMutation = useMutation({
    mutationFn: (data: { libraryId: string; name: string }) => generateApiKeyFn({ data }),
    onSuccess: (data) => {
      setGeneratedKey(data.key)
      setKeyName(data.name)
      toastSuccess(t('apiKeys.generateSuccess'))
      // Don't invalidate queries here - wait until modal closes to avoid re-render
    },
    onError: (error) => {
      toastError(t('toasts.error', { error: error.message }))
    },
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { formData, errors } = validateForm(e.currentTarget, schema)
    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }
    const name = formData.get('name') as string
    generateMutation.mutate({ libraryId, name })
  }

  const handleCopy = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey)
      toastSuccess(t('apiKeys.copiedToClipboard'))
    }
  }

  const handleClose = () => {
    // Only invalidate queries when closing the modal to refresh the list
    if (generatedKey) {
      queryClient.invalidateQueries(getApiKeysQueryOptions(libraryId))
    }
    setGeneratedKey(null)
    setKeyName('')
    generateMutation.reset()
    ref.current?.close()
  }

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box max-w-2xl">
        <h3 className="mb-4 text-lg font-bold">{t('apiKeys.generateTitle')}</h3>

        {!generatedKey ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              name="name"
              type="text"
              label={t('apiKeys.nameLabel')}
              placeholder={t('apiKeys.namePlaceholder')}
              required
              schema={schema}
            />

            <div className="alert alert-info">
              <div>
                <div className="font-bold">{t('apiKeys.securityWarningTitle')}</div>
                <div className="text-sm">{t('apiKeys.securityWarningText')}</div>
              </div>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={handleClose}
                disabled={generateMutation.isPending}
              >
                {t('actions.cancel')}
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={generateMutation.isPending}>
                {generateMutation.isPending && <span className="loading loading-spinner loading-sm" />}
                {t('apiKeys.generate')}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="alert alert-success">
              <div>
                <div className="font-bold">{t('apiKeys.generatedSuccessTitle', { name: keyName })}</div>
                <div className="text-sm">{t('apiKeys.generatedSuccessText')}</div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="label">
                <span className="label-text font-bold">{t('apiKeys.yourApiKey')}</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={generatedKey}
                  readOnly
                  className="input input-bordered flex-1 font-mono text-sm"
                />
                <button type="button" className="btn btn-square btn-primary" onClick={handleCopy}>
                  <CopyIcon className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="alert alert-warning">
              <div>
                <div className="font-bold">{t('apiKeys.copyWarningTitle')}</div>
                <div className="text-sm">{t('apiKeys.copyWarningText')}</div>
              </div>
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-primary btn-sm" onClick={handleClose}>
                {t('actions.close')}
              </button>
            </div>
          </div>
        )}

        {generateMutation.isError && !generatedKey && (
          <div className="alert alert-error mt-4">
            <span>
              {generateMutation.error instanceof Error ? generateMutation.error.message : t('apiKeys.generateError')}
            </span>
          </div>
        )}
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button type="button" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
