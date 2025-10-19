import { RefObject, useState } from 'react'
import { z } from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { Language, translate } from '../../i18n'
import { useTranslation } from '../../i18n/use-translation-hook'
import { CopyIcon } from '../../icons/copy-icon'
import { Input } from '../form/input'
import { toastError, toastSuccess } from '../georgeToaster'
import { useLibraryActions } from './use-library-actions'

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
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [keyName, setKeyName] = useState<string>('')

  const { generateApiKey, isPending } = useLibraryActions(libraryId)
  const schema = getApiKeyFormSchema(language)

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const { formData, errors } = validateForm(e.currentTarget, schema)
    if (errors) {
      toastError(errors.map((error) => <div key={error}>{error}</div>))
      return
    }
    const name = formData.get('name') as string
    generateApiKey(name, {
      onSuccess: (data) => {
        setGeneratedKey(data.key)
      },
    })
  }

  const handleCopy = async () => {
    if (generatedKey) {
      await navigator.clipboard.writeText(generatedKey)
      toastSuccess(t('apiKeys.copiedToClipboard'))
    }
  }

  const handleClose = () => {
    // Only invalidate queries when closing the modal to refresh the list

    setGeneratedKey(null)
    setKeyName('')
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
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleClose} disabled={isPending}>
                {t('actions.cancel')}
              </button>
              <button type="submit" className="btn btn-primary btn-sm" disabled={isPending}>
                {isPending && <span className="loading loading-spinner loading-sm" />}
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
      </div>
      <form method="dialog" className="modal-backdrop" onClick={handleClose}>
        <button type="button" onClick={handleClose}>
          Close
        </button>
      </form>
    </dialog>
  )
}
