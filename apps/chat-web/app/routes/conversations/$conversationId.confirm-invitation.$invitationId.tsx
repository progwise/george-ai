import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

import { useAuth } from '../../auth/auth-hook'
import { useTranslation } from '../../i18n/use-translation-hook'
import { confirmInvitation } from '../../server-functions/participations'

export const ConfirmInvitation = () => {
  const { conversationId, invitationId } = useParams({
    from: '/conversations/$conversationId/confirm-invitation/$invitationId',
    strict: true,
  })
  const authContext = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate: confirm, isPending } = useMutation({
    mutationFn: async () => {
      if (!authContext.user?.id) {
        throw new Error('User must be logged in to confirm invitation')
      }
      return await confirmInvitation({
        data: {
          conversationId,
          invitationId,
          userId: authContext.user.id,
        },
      })
    },
    onSettled: () => {
      navigate({ to: '/conversations/$' })
    },
  })

  if (!authContext.user) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => authContext.login()}>
        {t('conversations.signInToJoin')}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-md bg-white p-6 shadow-md">
      <h1 className="text-xl font-semibold">{t('invitations.confirmTitle')}</h1>
      <p className="text-center text-base-content">{t('invitations.confirmDescription')}</p>
      <button
        type="button"
        className={`btn btn-primary btn-sm ${isPending ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={() => confirm()}
        disabled={isPending}
      >
        {t('actions.confirm')}
      </button>
    </div>
  )
}

export const Route = createFileRoute('/conversations/$conversationId/confirm-invitation/$invitationId')({
  component: ConfirmInvitation,
  loader: async ({ params }: { params: { conversationId: string; invitationId: string } }) => {
    const { conversationId, invitationId } = params
    if (!conversationId || !invitationId) {
      throw new Error('Both Conversation ID and Invitation ID are required')
    }
    return { conversationId, invitationId }
  },
})
