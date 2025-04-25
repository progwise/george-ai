import { useMutation } from '@tanstack/react-query'
import { useNavigate, useParams } from '@tanstack/react-router'
import { createFileRoute } from '@tanstack/react-router'

import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { queryKeys } from '../../../query-keys'
import { confirmInvitation } from '../../../server-functions/participations'

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
            'User is already a participant',
            () => {
              toastError(t('invitations.alreadyParticipant'))
              navigate({ to: `/conversations/${conversationId}` })
            },
          ],
          [
            'Conversation not found',
            () => {
              toastError(t('invitations.conversationNotFound'))
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
            'Invalid invitation',
            () => {
              toastError(t('invitations.invalidInvitation'))
              navigate({ to: '/' })
            },
          ],
          [
            'Email address does not match',
            () => {
              toastError(t('invitations.emailMismatch'))
              navigate({ to: '/' })
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
        throw error
      }
    },
    onSuccess: () => {
      navigate({ to: `/conversations/${conversationId}` })
      toastSuccess(t('invitations.invitationAccepted'))
    },
  })

  return (
    <div className="flex flex-col items-center justify-center space-y-4 rounded-md p-6 shadow-md">
      <span className="text-center text-base-content">{t('invitations.confirmDescription')}</span>
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
