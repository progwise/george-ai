import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

graphql(`
  fragment ConversationBase on AiConversation {
    id
    ownerId
    createdAt
    updatedAt
  }
`)

const ConversationsQueryDocument = graphql(`
  query getUserConversations {
    aiConversations {
      id
      ...ConversationSelector_Conversation
    }
  }
`)

export const getConversations = createServerFn({ method: 'GET' }).handler(async (ctx) =>
  backendRequest(ConversationsQueryDocument, ctx.data),
)

export const getConversationsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Conversations],
    queryFn: () => getConversations(),
  })

const CreateMessageDocument = graphql(`
  mutation sendMessage($data: AiConversationMessageInput!) {
    sendMessage(data: $data) {
      id
      createdAt
    }
  }
`)

export const sendMessage = createServerFn({ method: 'POST' })
  .validator((data: { content: string; conversationId: string; recipientAssistantIds: string[] }) =>
    z
      .object({
        content: z.string(),
        conversationId: z.string(),
        recipientAssistantIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) => {
    const messageData = {
      content: ctx.data.content,
      conversationId: ctx.data.conversationId,
      recipientAssistantIds: ctx.data.recipientAssistantIds,
    }

    return backendRequest(CreateMessageDocument, {
      data: messageData,
    })
  })

const CreateConversationDocument = graphql(`
  mutation createConversation($data: AiConversationCreateInput!) {
    createAiConversation(data: $data) {
      id
    }
  }
`)

export const createConversation = createServerFn({ method: 'POST' })
  .validator((data: { userIds: string[]; assistantIds: string[] }) =>
    z
      .object({
        userIds: z.array(z.string()),
        assistantIds: z.array(z.string()),
      })
      .parse(data),
  )
  .handler((ctx) => {
    return backendRequest(CreateConversationDocument, {
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

export const deleteConversations = createServerFn({ method: 'POST' })
  .validator((data: { conversationIds: string[] }) => {
    return z
      .object({
        conversationIds: z.array(z.string()),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    return backendRequest(
      graphql(`
        mutation deleteConversations($conversationIds: [String!]!) {
          deleteAiConversations(conversationIds: $conversationIds)
        }
      `),
      ctx.data,
    )
  })

const LeaveConversationDocument = graphql(`
  mutation leaveConversation($participantId: String!) {
    leaveAiConversation(participantId: $participantId) {
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
