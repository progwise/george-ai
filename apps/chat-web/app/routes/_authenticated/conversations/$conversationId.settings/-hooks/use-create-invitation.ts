import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { useCallback, useState } from 'react'
import { z } from 'zod'

import { toastError, toastSuccess } from '../../../../../components/georgeToaster'
import { graphql } from '../../../../../gql'
import { useTranslation } from '../../../../../i18n/use-translation-hook'
import { backendRequest } from '../../../../../server-functions/backend'
import { getConversationQueryOptions } from '../../../../../server-functions/conversations'

const CreateConversationInvitationsMutation = graphql(`
  mutation createConversationInvitations($conversationId: String!, $data: [ConversationInvitationInput!]!) {
    createConversationInvitations(conversationId: $conversationId, data: $data) {
      id
    }
  }
`)

const emailSchema = z
  .string()
  .email()
  .transform((email) => email.trim().toLowerCase())

export const createConversationInvitation = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      conversationId: string
      data: {
        email: string
        allowDifferentEmailAddress: boolean
        allowMultipleParticipants: boolean
      }
    }) =>
      z
        .object({
          conversationId: z.string(),
          data: z.object({
            email: emailSchema,
            allowDifferentEmailAddress: z.boolean(),
            allowMultipleParticipants: z.boolean(),
          }),
        })
        .parse(data),
  )
  .handler(async (ctx) => {
    const conversationInvitation = await backendRequest(CreateConversationInvitationsMutation, {
      conversationId: ctx.data.conversationId,
      data: [ctx.data.data],
    })

    return conversationInvitation.createConversationInvitations
  })

interface CreateInvitationOptions {
  conversationId: string
}

export const useCreateInvitation = ({ conversationId }: CreateInvitationOptions) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()

  const [invitedEmails, setInvitedEmails] = useState<string[]>([])
  const [pendingEmailInvites, setPendingEmailInvites] = useState<string[]>([])

  const { mutateAsync } = useMutation({
    mutationFn: createConversationInvitation,
    onMutate: (variables) => {
      const { email } = variables.data.data
      setPendingEmailInvites((prev) => [...prev, email])
    },
    onSettled: async (_data, _error, variables) => {
      const { email } = variables.data.data
      setPendingEmailInvites((prev) => prev.filter((emailInvite) => emailInvite !== email))

      await queryClient.invalidateQueries(getConversationQueryOptions(conversationId))
    },
    onSuccess: (_data, context) => {
      const { email } = context.data.data
      setInvitedEmails((prev) => {
        const newEmails = [...prev, email]
        return Array.from(new Set(newEmails)) // Ensure unique emails
      })
      toastSuccess(t('invitations.invitationSent'))
    },
    onError: (_error, context) => {
      const { email } = context.data.data
      toastError(t('invitations.failedToSendInvitation', { emails: email }))
    },
  })

  const createInvitation = useCallback(
    (data: { email: string; allowDifferentEmailAddress: boolean; allowMultipleParticipants: boolean }) =>
      mutateAsync({ data: { conversationId, data } }),
    [mutateAsync, conversationId],
  )

  return { createInvitation, pendingEmailInvites, invitedEmails }
}
