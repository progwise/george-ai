import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../../gql'
import { backendRequest } from '../../../../../server-functions/backend'
import {
  getConversationQueryOptions,
  getConversationsQueryOptions,
} from '../../../../../server-functions/conversations'

const RemoveParticipantDocument = graphql(`
  mutation removeConversationParticipant($participantId: String!) {
    removeConversationParticipant(participantId: $participantId) {
      id
    }
  }
`)

const removeConversationParticipant = createServerFn({ method: 'POST' })
  .validator((participantId: string) => z.string().nonempty().parse(participantId))
  .handler((ctx) =>
    backendRequest(RemoveParticipantDocument, {
      participantId: ctx.data,
    }),
  )

const AddConversationParticipantsDocument = graphql(`
  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {
    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {
      id
    }
  }
`)

const addConversationParticipants = createServerFn({ method: 'POST' })
  .validator((data: { conversationId: string; userIds: string[]; assistantIds: string[] }) =>
    z
      .object({
        conversationId: z.string(),
        userIds: z.array(z.string()),
        assistantIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(AddConversationParticipantsDocument, {
      conversationId: ctx.data.conversationId,
      userIds: ctx.data.userIds,
      assistantIds: ctx.data.assistantIds,
    }),
  )

export const useConversationParticipantsMutations = ({ conversationId }: { conversationId: string }) => {
  const queryClient = useQueryClient()

  const { mutate: addParticipants } = useMutation({
    mutationFn: async ({ assistantIds = [], userIds = [] }: { assistantIds?: string[]; userIds?: string[] }) => {
      return await addConversationParticipants({
        data: { conversationId, assistantIds, userIds },
      })
    },

    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationQueryOptions(conversationId))
      await queryClient.invalidateQueries(getConversationsQueryOptions())
    },
  })

  const { mutate: removeParticipant } = useMutation({
    mutationFn: (participantId: string) => removeConversationParticipant({ data: participantId }),
    onMutate: async (participantId) => {
      await queryClient.cancelQueries(getConversationQueryOptions(conversationId))
      const previousConversation = queryClient.getQueryData(getConversationQueryOptions(conversationId).queryKey)

      if (previousConversation) {
        const updatedConversation = {
          ...previousConversation,
          participants: previousConversation.participants.filter((participant) => participant.id !== participantId),
        }

        queryClient.setQueryData(getConversationQueryOptions(conversationId).queryKey, updatedConversation)
      }
    },
    onSettled: async () => {
      await queryClient.invalidateQueries(getConversationQueryOptions(conversationId))
      await queryClient.invalidateQueries(getConversationsQueryOptions())
    },
  })

  return {
    addParticipants,
    removeParticipant,
  }
}
