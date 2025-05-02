import { queryKeys } from '../../query-keys'
import { toastError, toastSuccess } from '../georgeToaster'
import { validateEmails } from './email-validation'

export const sendEmailInvitations = async ({
  email,
  conversationId,
  allowDifferentEmailAddress,
  allowMultipleParticipants,
  setIsSendingInvitation,
  t,
  queryClient,
  createInvitation,
}: {
  email: string
  conversationId: string
  allowDifferentEmailAddress: boolean
  allowMultipleParticipants: boolean
  setEmailError: (error: string | null) => void
  setIsSendingInvitation: (isSending: boolean) => void
  t: (key: string, params?: Record<string, string>) => string
  queryClient: ReturnType<typeof import('@tanstack/react-query').useQueryClient>
  createInvitation: ReturnType<typeof import('@tanstack/react-query').useMutation>['mutateAsync']
}) => {
  const { emails } = validateEmails(email)

  setIsSendingInvitation(true)

  try {
    const results = await Promise.allSettled(
      emails.map((email) =>
        createInvitation({
          email,
          allowDifferentEmailAddress,
          allowMultipleParticipants,
          conversationId,
        }),
      ),
    )

    const failedEmails = results
      .map((result, index) => (result.status === 'rejected' ? emails[index] : null))
      .filter((email) => email !== null)

    if (failedEmails.length > 0) {
      toastError(
        t('invitations.failedToSendInvitation', {
          error: t('invitations.failedEmails', { emails: failedEmails.join(', ') }),
        }),
      )
    } else {
      toastSuccess(t('invitations.invitationSent'))
    }

    await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversation, conversationId] })
  } catch (error) {
    toastError(t('invitations.failedToSendInvitation', { error: error.message }))
  } finally {
    setIsSendingInvitation(false)
  }
}
