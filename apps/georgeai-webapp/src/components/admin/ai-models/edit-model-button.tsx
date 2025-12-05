import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { graphql } from '../../../gql'
import { EditModelButton_LanguageModelFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { queryKeys } from '../../../query-keys'
import { DialogForm } from '../../dialog-form'
import { Input } from '../../form/input'
import { toastError, toastSuccess } from '../../georgeToaster'
import { updateAiLanguageModel } from './update-model'

graphql(`
  fragment EditModelButton_LanguageModel on AiLanguageModel {
    id
    provider
    name
    adminNotes
    enabled
  }
`)

interface EditModelButtonProps {
  model: EditModelButton_LanguageModelFragment
}

export const EditModelButton = ({ model }: EditModelButtonProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const editDialogRef = useRef<HTMLDialogElement>(null)
  const updateMutation = useMutation({
    mutationFn: (data: { id: string; enabled?: boolean; adminNotes?: string }) => updateAiLanguageModel({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.AiLanguageModels] })
      toastSuccess(t('admin.aiModels.updateSuccess'))
      editDialogRef.current?.close()
    },
    onError: (error: Error) => {
      toastError(error.message)
    },
  })
  const handleUpdateSubmit = (formData: FormData) => {
    const enabled = formData.get('enabled') === 'on'
    const adminNotes = formData.get('adminNotes') as string
    updateMutation.mutate({
      id: model.id,
      enabled,
      adminNotes: adminNotes || undefined,
    })
  }
  return (
    <>
      <button type="button" onClick={() => editDialogRef.current?.showModal()} className="btn btn-ghost btn-sm">
        {t('admin.aiModels.edit')}
      </button>
      <DialogForm
        ref={editDialogRef}
        title={t('admin.aiModels.editModel')}
        description={`${model.provider}: ${model.name}`}
        onSubmit={handleUpdateSubmit}
        submitButtonText={t('admin.aiModels.save')}
        disabledSubmit={updateMutation.isPending}
      >
        <div className="flex w-full flex-col gap-4">
          <div className="card bg-base-200 shadow-sm">
            <div className="card-body p-4">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  name="enabled"
                  className="toggle toggle-primary"
                  defaultChecked={model.enabled}
                />
                <div className="flex flex-col">
                  <span className="label-text font-semibold">{t('admin.aiModels.enabled')}</span>
                  <span className="label-text-alt opacity-60">
                    {model.enabled ? t('admin.aiModels.modelEnabled') : t('admin.aiModels.modelDisabled')}
                  </span>
                </div>
              </label>
            </div>
          </div>

          <Input
            name="adminNotes"
            type="textarea"
            label={t('admin.aiModels.adminNotes')}
            placeholder={t('admin.aiModels.adminNotesPlaceholder')}
            value={model.adminNotes}
            className="min-h-32"
          />
        </div>
      </DialogForm>
    </>
  )
}
