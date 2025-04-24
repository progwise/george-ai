import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

import { useAuth } from '../../auth/auth'
import { toastError } from '../../components/georgeToaster'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { confirmInvitation } from '../../server-functions/participations'

const conversationInvitationQueryOptions = (conversationId?: string, invitationId?: string) => ({
  queryKey: [queryKeys.ConversationInvitation, conversationId, invitationId],
  queryFn: async () => {
    if (!conversationId || !invitationId) {
      return null
    }
    return { conversationId, invitationId }
  },
  enabled: !!conversationId && !!invitationId,
})

export const Route = createFileRoute('/conversations/$conversationId/confirm-invitation/$invitationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(conversationInvitationQueryOptions(params.conversationId, params.invitationId))
  },
  staleTime: 0,
})

function RouteComponent() {
  const { conversationId, invitationId } = useParams({
    from: '/conversations/$conversationId/confirm-invitation/$invitationId',
    strict: true,
  })
  const { user } = Route.useRouteContext()
  const { login } = useAuth()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate: confirm, isPending } = useMutation({
    mutationFn: async () => {
      if (!user?.id) {
        throw new Error('User must be logged in to confirm invitation')
      }
      try {
        return await confirmInvitation({
          data: {
            conversationId,
            invitationId,
            userId: user.id,
            email: user.email?.toLowerCase(),
          },
        })
      } catch (error) {
        const errorHandlers = new Map([
          [
            'Conversation not found',
            () => {
              toastError(t('invitations.conversationNotFound'))
              navigate({ to: '/' })
            },
          ],
          [
            'User is already a participant',
            () => {
              toastError(t('invitations.alreadyParticipant'))
              navigate({ to: `/conversations/${conversationId}` })
            },
          ],
          [
            'Invitation not found',
            () => {
              toastError(t('invitations.invitationNotFound'))
            },
          ],
          [
            'Invalid invitation',
            () => {
              toastError(t('invitations.invalidInvitation'))
            },
          ],
          [
            'Email address does not match',
            () => {
              toastError(t('invitations.emailMismatch'))
            },
          ],
          [
            'Email address does not match the invitation for this single-use invitation',
            () => {
              toastError(t('invitations.emailMismatchSingleUse'))
            },
          ],
        ])

        const handler = Array.from(errorHandlers.keys()).find((key) => error.message.includes(key))
        if (handler) {
          errorHandlers.get(handler)?.()
        } else {
          console.error('Unexpected error:', error)
          toastError(t('errors.unexpectedError'))
        }
        throw error
      }
    },
    onSuccess: () => {
      navigate({ to: `/conversations/${conversationId}` })
    },
  })

  if (!user) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => login()}>
        {t('conversations.signInToJoin')}
      </button>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-md p-6 shadow-md">
      <span className="text-center text-base-content">{t('invitations.confirmDescription')}</span>
      <button
        type="button"
        className={`btn btn-primary btn-sm ${isPending ? 'cursor-not-allowed opacity-50' : ''}`}
        onClick={() => confirm()}
        disabled={isPending}
      >
        {t('invitations.confirmInvitation')}
      </button>
    </div>
  )
}
