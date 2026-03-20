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
  const visionModelRef = useRef<ModelSelectInferenceModel | null>(null)
  const { manifest, updateWorkspace, isPending } = useWorkspace(user)

  const handleUpdate = () => {
    if (!manifest) return
    if (!embeddingModelRef.current) {
      toastError('Please select an embedding model before saving workspace settings.')
      return
    }
    if (!visionModelRef.current) {
      toastError('Please select an embedding model before saving workspace settings.')
      return
    }

    const settings = {
      ...manifest.settings,
      embedding: embeddingModelRef.current,
      vision: visionModelRef.current,
    }

    updateWorkspace(
      { workspaceId: manifest.workspaceId, name: manifest.name, settings },
      {
        onSuccess: (data) => {
          toastSuccess(
            `Successfully updated workspace settings for ${data.name}: Embedding (${data.settings.embedding?.modelName || 'No embedding model configured'}), Vision (${data.settings.vision?.modelName || 'No vision model configured'})`,
          )
        },
        onError: (error) => {
          toastError(`Failed to update workspace settings: ${error.message}`)
        },
      },
    )
    ref.current?.close()
  }

  const { embeddingModel, visionModel } = useMemo(() => {
    if (!manifest) return {}

    const embeddingModel = manifest.settings.embedding
      ? {
          modelDriver: manifest.settings.embedding.modelDriver,
          modelName: manifest.settings.embedding.modelName,
        }
      : undefined

    const visionModel = manifest.settings.vision
      ? {
          modelDriver: manifest.settings.vision.modelDriver,
          modelName: manifest.settings.vision.modelName,
        }
      : undefined

    return { embeddingModel, visionModel }
  }, [manifest])

  return (
    <dialog className="modal" ref={ref} open>
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
              <div className="flex">
                <ModelSelect
                  selectedModelRef={embeddingModelRef}
                  name="embeddingModel"
                  label={t('workspace.settings.embeddingModel')}
                  value={embeddingModel}
                  className="col-span-1"
                  capability="embedding"
                />
                <ModelSelect
                  selectedModelRef={visionModelRef}
                  name="visionModel"
                  label={t('workspace.settings.visionModel')}
                  value={visionModel}
                  className="col-span-1"
                  capability="vision"
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
