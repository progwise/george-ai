import { RefObject, useState } from 'react'
import { z } from 'zod'

import { UserFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { Input } from '../../form/input'
import { useWorkspace } from '../use-workspace'

interface InviteMemberDialogProps {
  user: UserFragment
  ref: RefObject<HTMLDialogElement | null>
}

export const InviteMemberDialog = ({ user, ref }: InviteMemberDialogProps) => {
  const { t } = useTranslation()
  const [error, setError] = useState<string | null>(null)

  const { inviteMember, isPending } = useWorkspace(user)

  const schema = z.object({
    email: z.string().email(t('workspace.members.emailInvalid')),
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

    inviteMember(email.trim(), {
      onSuccess: () => {
        setError(null)
        ref.current?.close()
      },
      onError: (error: Error) => {
        setError(error.message)
      },
    })
  }

  return (
    <DialogForm
      ref={ref}
      title={t('workspace.members.inviteTitle')}
      description={t('workspace.members.inviteDescription')}
      onSubmit={handleSubmit}
      submitButtonText={t('workspace.members.invite')}
      disabledSubmit={isPending}
    >
      {error && (
        <div className="mb-4 alert alert-error">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="size-6 shrink-0 stroke-current"
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
        disabled={isPending}
        schema={schema}
        onChange={() => error && setError(null)}
      />
    </DialogForm>
  )
}
