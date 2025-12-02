import { useMutation } from '@tanstack/react-query'
import { RefObject, useState } from 'react'
import { z } from 'zod'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { Input } from '../../form/input'
import { toastError, toastSuccess } from '../../georgeToaster'
import { inviteWorkspaceMemberFn } from './server-functions/invite-member'

interface InviteMemberDialogProps {
  ref: RefObject<HTMLDialogElement | null>
  workspaceId: string
  onSuccess?: () => void
}

export const InviteMemberDialog = ({ ref, workspaceId, onSuccess }: InviteMemberDialogProps) => {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  const schema = z.object({
    email: z.string().email(t('workspace.members.emailInvalid')),
  })

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      return await inviteWorkspaceMemberFn({ data: { workspaceId, email } })
    },
    onSuccess: (_, email) => {
      toastSuccess(t('workspace.members.inviteSuccess', { email }))
      setError(null)

      ref.current?.close()

      // Reset form after dialog close animation completes
      setTimeout(() => {
        const form = ref.current?.querySelector('form')
        form?.reset()
      }, 200)

      onSuccess?.()
    },
    onError: (error) => {
      setError(error.message)
      toastError(t('workspace.members.inviteError', { message: error.message }))
    },
  })

  const handleSubmit = (formData: FormData) => {
    const email = formData.get('email') as string

    // Basic validation
    if (!email?.trim()) {
      setError(t('workspace.members.emailRequired'))
      return
    }

    // Validate email format
    const result = schema.safeParse({ email: email.trim() })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    inviteMutation.mutate(email.trim())
  }

  return (
    <DialogForm
      ref={ref}
      title={t('workspace.members.inviteTitle')}
      description={t('workspace.members.inviteDescription')}
      onSubmit={handleSubmit}
      submitButtonText={t('workspace.members.invite')}
      disabledSubmit={inviteMutation.isPending}
    >
      {error && (
        <div className="alert alert-error mb-4">
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
        name="email"
        type="email"
        label={t('workspace.members.emailLabel')}
        placeholder={t('workspace.members.emailPlaceholder')}
        required
        disabled={inviteMutation.isPending}
        schema={schema}
        onChange={() => error && setError(null)}
      />
    </DialogForm>
  )
}
