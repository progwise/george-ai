import { useMutation, useQueryClient } from '@tanstack/react-query'

import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { toastError, toastSuccess } from '../georgeToaster'
import { validateEmails } from './email-validation'

export const useSendEmailInvitations = () => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const { mutateAsync: createInvitation } = useMutation({
    mutationFn: async ({
      email,
      allowDifferentEmailAddress,
      allowMultipleParticipants,
      conversationId,
    }: {
      email: string
      allowDifferentEmailAddress: boolean
      allowMultipleParticipants: boolean
      conversationId: string
    }) => {
      // Replace this with the actual API call to create an invitation
      return Promise.resolve()
    },
    onError: (error) => {
      toastError(t('invitations.failedToSendInvitation', { error: error.message }))
    },
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversation] })
    },
  })

  const sendEmailInvitations = async ({
    email,
    conversationId,
    allowDifferentEmailAddress,
    allowMultipleParticipants,
  }: {
    email: string
    conversationId: string
    allowDifferentEmailAddress: boolean
    allowMultipleParticipants: boolean
  }) => {
    const { emails, invalidEmails } = validateEmails(email)

    if (invalidEmails.length > 0) {
      toastError(t('errors.invalidEmail'))
      return
    }

    try {
      const invitationStatus = await Promise.allSettled(
        emails.map((email) =>
          createInvitation({
            email,
            allowDifferentEmailAddress,
            allowMultipleParticipants,
            conversationId,
          }),
        ),
      )

      const failedEmails = invitationStatus
        .map((result, index) => (result.status === 'rejected' ? emails[index] : null))
        .filter((email) => email !== null)

      if (failedEmails.length > 0) {
        toastError(t('invitations.failedToSendInvitation', { emails: failedEmails.join(', ') }))
      } else {
        toastSuccess(t('invitations.invitationSent'))
      }

      await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversation, conversationId] })
    } catch (error) {
      toastError(t('invitations.failedToSendInvitation', { error: error.message }))
    }
  }

  return { sendEmailInvitations }
}
