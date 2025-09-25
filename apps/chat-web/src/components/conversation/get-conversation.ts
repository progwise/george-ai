import { queryOptions } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

graphql(`
  fragment ConversationDetail on AiConversation {
    ...ConversationParticipants_Conversation
    ...ConversationDelete_Conversation
    ...ConversationHistory_Conversation
    ...ConversationForm_Conversation
    ...ConversationParticipantsDialogButton_Conversation
  }
`)

const conversationDetailQueryDocument = graphql(`
  query getConversation($conversationId: String!) {
    aiConversation(conversationId: $conversationId) {
      ...ConversationDetail
    }
  }
`)

const getConversation = createServerFn({ method: 'GET' })
  .inputValidator(({ conversationId }: { conversationId: string }) => ({
    conversationId: z.string().nonempty().parse(conversationId),
  }))
  .handler(async (ctx) => {
    const { aiConversation } = await backendRequest(conversationDetailQueryDocument, {
      conversationId: ctx.data.conversationId,
    })
    if (!aiConversation) {
      throw notFound()
    }
    return aiConversation
  })

export const getConversationQueryOptions = (conversationId: string) =>
  queryOptions({
    queryKey: [queryKeys.Conversation, conversationId],
    queryFn: () => getConversation({ data: { conversationId } }),
  })
