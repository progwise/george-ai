import { RefObject, useState } from 'react'
import { z } from 'zod'

import { UserFragment } from '../../gql/graphql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { DialogForm } from '../dialog-form'
import { Input } from '../form/input'
import { useWorkspace } from './use-workspace'

interface CreateWorkspaceDialogProps {
  dialogRef: RefObject<HTMLDialogElement | null>
  user: UserFragment
}

export const CreateWorkspaceDialog = ({ dialogRef, user }: CreateWorkspaceDialogProps) => {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  const { createWorkspace, isPending } = useWorkspace(user)

  const handleSubmit = (formData: FormData) => {
    const name = formData.get('name') as string
    const slug = formData.get('slug') as string

    // Basic validation
    if (!name?.trim()) {
      setError(t('workspace.nameRequired'))
      return
    }

    if (!slug?.trim()) {
      setError(t('workspace.slugRequired'))
      return
    }

    // Validate slug format (lowercase, alphanumeric, hyphens only)
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError(t('workspace.slugInvalid'))
      return
    }

    createWorkspace(
      { name: name.trim(), slug: slug.trim() },
      {
        onSuccess: () => {
          setError(null)
          dialogRef.current?.close()
        },
      },
    )
  }

  const handleNameInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Clear any previous errors when user starts typing
    if (error) {
      setError(null)
    }

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
      submitButtonText={t('workspace.createTitle')}
      disabledSubmit={isPending}
    >
      {error && (
        <div className="alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 shrink-0 stroke-current"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error}</span>
        </div>
      )}

      <Input
        name="name"
        label={t('workspace.name')}
        placeholder={t('workspace.namePlaceholder')}
        required
        disabled={isPending}
        schema={schema}
        onChange={handleNameInput}
      />

      <Input
        name="slug"
        label={t('workspace.slug')}
        placeholder={t('workspace.slugPlaceholder')}
        required
        disabled={isPending}
        schema={schema}
        onChange={() => error && setError(null)}
      />

      <div className="text-base-content/70 text-sm">{t('workspace.slugHint')}</div>
    </DialogForm>
  )
}
