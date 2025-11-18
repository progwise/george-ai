import { useMutation, useQueryClient } from '@tanstack/react-query'
import { RefObject } from 'react'
import { z } from 'zod'

import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { toastError, toastSuccess } from '../georgeToaster'
import { createWorkspaceFn } from './server-functions/create-workspace'

interface CreateWorkspaceDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>
  onWorkspaceCreated?: (workspaceId: string) => void
}

export const CreateWorkspaceDialog = ({ dialogRef, onWorkspaceCreated }: CreateWorkspaceDialogProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      return await createWorkspaceFn({ data })
    },
    onSuccess: (workspace) => {
      toastSuccess(t('workspace.createSuccess'))
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      dialogRef.current?.close()
      onWorkspaceCreated?.(workspace.id)
    },
    onError: (error) => {
      toastError(error.message)
    },
  })

  const handleSubmit = (formData: FormData) => {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    // Basic validation
    if (!name?.trim()) {
      toastError(t('workspace.nameRequired'))
      return
    }

    if (!slug?.trim()) {
      toastError(t('workspace.slugRequired'))
      return
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      toastError(t('workspace.slugInvalid'))
      return
    }

    createMutation.mutate({ name: name.trim(), slug: slug.trim() })
  }

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nameInput = e.currentTarget
    const slugInput = nameInput.form?.querySelector('input[name="slug"]') as HTMLInputElement | null

    if (slugInput && !slugInput.value) {
      // Auto-generate slug from name
      const slug = nameInput.value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '')
      slugInput.value = slug
    }
  }

  const schema = z.object({
    name: z.string().min(1, t('workspace.nameRequired')),
    slug: z.string().regex(/^[a-z0-9-]+$/, t('workspace.slugInvalid')),
  })

  return (
    <DialogForm
      ref={dialogRef}
      title={t('workspace.createTitle')}
      description={t('workspace.createDescription')}
      onSubmit={handleSubmit}
      submitButtonText={t('workspace.create')}
      disabledSubmit={createMutation.isPending}
    >
      <Input
        name="name"
        label={t('workspace.name')}
        placeholder={t('workspace.namePlaceholder')}
        required
        disabled={createMutation.isPending}
        schema={schema}
        onChange={handleNameInput}
      />

      <Input
        name="slug"
        label={t('workspace.slug')}
        placeholder={t('workspace.slugPlaceholder')}
        required
        disabled={createMutation.isPending}
        schema={schema}
      />

      <div className="text-base-content/70 text-sm">{t('workspace.slugHint')}</div>
    </DialogForm>
  )
}
