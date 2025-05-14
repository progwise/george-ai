import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useNavigate, useParams } from '@tanstack/react-router'

import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { queryKeys } from '../../../query-keys'
import { confirmInvitation } from '../../../server-functions/conversation-participations'

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

export const Route = createFileRoute('/_authenticated/conversations/$conversationId/confirm-invitation/$invitationId')({
  component: RouteComponent,
  loader: async ({ context, params }) => {
    context.queryClient.ensureQueryData(conversationInvitationQueryOptions(params.conversationId, params.invitationId))
  },
  staleTime: 0,
})

function RouteComponent() {
  const { conversationId, invitationId } = useParams({
    from: '/_authenticated/conversations/$conversationId/confirm-invitation/$invitationId',
    strict: true,
  })
  const { user } = Route.useRouteContext()
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { mutate: confirm, isPending } = useMutation({
    mutationFn: async () => {
      return await confirmInvitation({
        data: {
          conversationId,
          invitationId,
          userId: user.id,
          email: user.email?.toLowerCase(),
        },
      })
    },
    onSuccess: () => {
      navigate({ to: `/conversations/${conversationId}` })
      toastSuccess(t('invitations.invitationAccepted'))
    },
    onError: (error) => {
      const errorHandlers = new Map([
        [
          'Conversation not found',
          () => {
            toastError(t('invitations.conversationNotFound'))
            navigate({ to: '/' })
          },
        ],
        [
          'Invalid invitation',
          () => {
            toastError(t('invitations.invalidInvitation'))
            navigate({ to: '/' })
          },
        ],
        [
          'Invitation not found',
          () => {
            toastError(t('invitations.invitationNotFound'))
            navigate({ to: '/' })
          },
        ],
        [
          'Invitation already used',
          () => {
            toastError(t('invitations.linkAlreadyUsed'))
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
          'Email address does not match the invitation for this single-use invitation',
          () => {
            toastError(t('invitations.emailMismatchSingleUse'))
            navigate({ to: '/' })
          },
        ],
      ])

      const handler = Array.from(errorHandlers.keys()).find((key) => error.message.includes(key))
      if (handler) {
        errorHandlers.get(handler)?.()
      } else {
        toastError(t('errors.unexpectedError'))
        navigate({ to: '/' })
      }
    },
  })

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-md p-6 shadow-md">
      <span className="text-base-content text-center">{t('invitations.confirmDescription')}</span>
      <div className="flex space-x-4">
        <button type="button" className="btn btn-sm" onClick={() => navigate({ to: '/' })}>
          {t('actions.cancel')}
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => confirm()} disabled={isPending}>
          {t('actions.confirm')}
        </button>
      </div>
    </div>
  )
}
