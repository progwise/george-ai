import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { validateEmails } from '../components/conversation/email-validation'
import { toastError, toastSuccess } from '../components/georgeToaster'
import { useTranslation } from '../i18n/use-translation-hook'
import { queryKeys } from '../query-keys'
import { createConversationInvitation } from '../server-functions/participations'

export const useEmailInvitations = (conversationId: string, userId: string) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const [isSendingInvitation, setIsSendingInvitation] = useState(false)

  const { mutateAsync: createInvitation } = useMutation({
    mutationFn: createConversationInvitation,
    onSettled: async () => {
      await queryClient.invalidateQueries({ queryKey: [queryKeys.Conversation, conversationId] })
    },
  })

  const sendEmailInvitations = async (
    conversationId: string,
    email: string,
    allowDifferentEmailAddress: boolean,
    allowMultipleParticipants: boolean,
  ) => {
    const { emails, invalidEmails } = validateEmails(email)

    if (invalidEmails.length > 0) {
      toastError(t('errors.invalidEmail'))
      return
    }

    setIsSendingInvitation(true)

    try {
      const invitationStatus = await Promise.allSettled(
        emails.map((email) =>
          createInvitation({
            data: {
              conversationId,
              inviterId: userId,
              data: {
                email,
                allowDifferentEmailAddress,
                allowMultipleParticipants,
              },
            },
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
    } finally {
      setIsSendingInvitation(false)
    }
  }

  return { sendEmailInvitations, isSendingInvitation }
}
