import { getLanguage } from '../../i18n/get-language'
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

  const language = await getLanguage()
  try {
    await Promise.all(
      emails.map((email) =>
        createInvitation({
          email,
          allowDifferentEmailAddress,
          allowMultipleParticipants,
          language,
          conversationId,
        }),
      ),
    )
    await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversation, conversationId] })
    toastSuccess(t('invitations.invitationSent'))
  } catch (error) {
    toastError(t('invitations.failedToSendInvitation', { error: error.message }))
  } finally {
    setIsSendingInvitation(false)
  }
}
