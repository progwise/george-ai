import { queryOptions } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

const ConversationsQueryDocument = graphql(`
  query getUserConversations($userId: String!) {
    aiConversations(userId: $userId) {
      id
      ...ConversationSelector_Conversation
    }
  }
`)

export const getConversations = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) => z.object({ userId: z.string() }).parse(data))
  .handler(async (ctx) => backendRequest(ConversationsQueryDocument, ctx.data))

export const getConversationsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [queryKeys.Conversations, userId],
    queryFn: () => getConversations({ data: { userId } }),
  })

const ConversationQueryDocument = graphql(`
  query getConversation($conversationId: String!) {
    aiConversation(conversationId: $conversationId) {
      ...ConversationParticipants_Conversation
      ...ConversationDelete_Conversation
      ...ConversationHistory_Conversation
      ...ConversationForm_Conversation
      ...ConversationParticipantsDialog_Conversation
    }
  }
`)

export const getConversation = createServerFn({ method: 'GET' })
  .validator((data: { conversationId: string }) => z.object({ conversationId: z.string() }).parse(data))
  .handler(async (ctx) => {
    const { aiConversation } = await backendRequest(ConversationQueryDocument, ctx.data)

    if (!aiConversation) {
      throw notFound()
    }

    return aiConversation
  })

export const getConversationQueryOptions = (conversationId: string) => ({
  queryKey: [queryKeys.Conversation, conversationId],
  queryFn: () => getConversation({ data: { conversationId } }),
})

const CreateMessageDocument = graphql(`
  mutation sendMessage($userId: String!, $data: AiConversationMessageInput!) {
    sendMessage(userId: $userId, data: $data) {
      id
      createdAt
    }
  }
`)

export const sendMessage = createServerFn({ method: 'POST' })
  .validator((data: { content: string; conversationId: string; userId: string; recipientAssistantIds: string[] }) =>
    z
      .object({
        content: z.string(),
        conversationId: z.string(),
        userId: z.string(),
        recipientAssistantIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) =>
    backendRequest(CreateMessageDocument, {
      userId: ctx.data.userId,
      data: {
        conversationId: ctx.data.conversationId,
        content: ctx.data.content,
        recipientAssistantIds: ctx.data.recipientAssistantIds,
      },
    }),
  )

const CreateConversationDocument = graphql(`
  mutation createConversation($ownerId: String!, $data: AiConversationCreateInput!) {
    createAiConversation(ownerId: $ownerId, data: $data) {
      id
    }
  }
`)

export const createConversation = createServerFn({ method: 'POST' })
  .validator((data: { userIds: string[]; assistantIds: string[]; ownerId: string }) =>
    z
      .object({
        userIds: z.array(z.string()),
        assistantIds: z.array(z.string()),
        ownerId: z.string(),
      })
      .parse(data),
  )
  .handler((ctx) => {
    if (!ctx.data.ownerId) {
      throw new Error('ownerId is required')
    }

    return backendRequest(CreateConversationDocument, {
      ownerId: ctx.data.ownerId,
      data: {
        assistantIds: ctx.data.assistantIds,
        userIds: ctx.data.userIds,
      },
    })
  })

const DeleteConversationDocument = graphql(`
  mutation deleteConversation($conversationId: String!) {
    deleteAiConversation(conversationId: $conversationId) {
      id
    }
  }
`)

export const deleteConversation = createServerFn({ method: 'POST' })
  .validator((data: { conversationId: string }) => z.object({ conversationId: z.string() }).parse(data))
  .handler(async (ctx) => {
    return backendRequest(DeleteConversationDocument, {
      conversationId: ctx.data.conversationId,
    })
  })

export const removeConversations = createServerFn({ method: 'POST' })
  .validator((data: { conversationIds: string[]; userId: string }) => {
    return z
      .object({
        conversationIds: z.array(z.string()),
        userId: z.string(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    return backendRequest(
      graphql(`
        mutation removeConversations($conversationIds: [String!]!, $userId: String!) {
          removeAiConversations(conversationIds: $conversationIds, userId: $userId)
        }
      `),
      ctx.data,
    )
  })

const LeaveConversationDocument = graphql(`
  mutation leaveConversation($participantId: String!) {
    leaveAiConversation(id: $participantId) {
      id
    }
  }
`)
export const leaveConversation = createServerFn({ method: 'POST' })
  .validator((data: { participantId: string }) => z.object({ participantId: z.string() }).parse(data))
  .handler((ctx) =>
    backendRequest(LeaveConversationDocument, {
      participantId: ctx.data.participantId,
    }),
  )
