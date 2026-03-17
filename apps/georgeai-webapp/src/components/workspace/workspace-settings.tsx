import { RefObject, useMemo, useRef } from 'react'

import { CurrentUserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { GearIcon } from '../../icons/gear-icon'
import { toastError, toastSuccess } from '../georgeToaster'
import { ModelSelect, ModelSelectInferenceModel } from '../model/model-select'
import { useWorkspace } from './use-workspace'

interface WorkspaceSettingsDialogProps {
  user: CurrentUserFragment
  ref: RefObject<HTMLDialogElement | null>
}

export const WorkspaceSettingsDialog = ({ user, ref }: WorkspaceSettingsDialogProps) => {
  const { t } = useTranslation()
  const embeddingModelRef = useRef<ModelSelectInferenceModel | null>(null)
  const { manifest, updateWorkspace, isPending } = useWorkspace(user)

  const handleUpdate = () => {
    if (!manifest) return
    if (!embeddingModelRef.current) {
      toastError('Please select an embedding model before saving workspace settings.')
      return
    }

    const settings = {
      ...manifest.settings,
      embedding: embeddingModelRef.current,
    }
    updateWorkspace(
      { workspaceId: manifest.workspaceId, name: manifest.name, settings },
      {
        onSuccess: (data) => {
          toastSuccess(
            `Successfully updated workspace settings for ${data.name} (${data.settings.embedding?.modelName || 'No embedding model configured'})`,
          )
        },
        onError: (error) => {
          toastError(`Failed to update workspace settings: ${error.message}`)
        },
      },
    )
    ref.current?.close()
  }

  const embeddingModel = useMemo(() => {
    if (!manifest) return undefined

    console.log('Current embedding model settings:', manifest.settings.embedding)

    return manifest.settings.embedding
      ? {
          modelDriver: manifest.settings.embedding.modelDriver,
          modelName: manifest.settings.embedding.modelName,
        }
      : undefined
  }, [manifest])

  return (
    <dialog className="modal" ref={ref}>
      <div className="modal-box">
        {!manifest ? (
          <h3 className="skeleton"></h3>
        ) : (
          <h3 className="text-lg font-bold">
            <GearIcon className="inline-block size-6" /> {manifest.name}
          </h3>
        )}
        <form method="dialog" className="mt-4">
          {/* Embedding Model Configuration Card */}

          <div className="">
            {!manifest ? (
              <div className="skeleton"></div>
            ) : (
              <div className="">
                <h4 className="text-lg text-base-content/80">{t('labels.libraryProcessingOptions')}</h4>
                <ModelSelect
                  selectedModelRef={embeddingModelRef}
                  name="embeddingModel"
                  label={t('labels.embeddingModelName')}
                  value={embeddingModel}
                  className="col-span-1"
                  capability="embedding"
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            className="btn absolute top-2 right-2 btn-circle btn-ghost btn-sm"
            aria-label={t('actions.close')}
          >
            ✕
          </button>
          <div className="flex justify-end">
            <button type="button" className="btn mt-2 btn-primary" disabled={isPending} onClick={handleUpdate}>
              Save
            </button>
          </div>
        </form>
      </div>
      <form method="dialog" className="modal-action"></form>
    </dialog>
  )
}
