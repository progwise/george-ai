import { createServerFn } from '@tanstack/start'
import { graphql } from '../gql'
import { backendRequest } from './backend'
import { queryKeys } from '../query-keys'

const ConversationsQueryDocument = graphql(`
  query getUserConversations($userId: String!) {
    aiConversations(userId: $userId) {
      id
      createdAt
      updatedAt
      assistants {
        id
        name
      }
      humans {
        id
        name
      }
      participants {
        id
        name
        userId
        assistantId
      }
    }
  }
`)

export const getMyConversations = createServerFn({ method: 'GET' })
  .validator((data: string) => data)
  .handler(async (ctx) =>
    backendRequest(ConversationsQueryDocument, { userId: ctx.data }),
  )

export const myConversationsQueryOptions = (userId?: string) => ({
  queryKey: [queryKeys.Conversations, userId],
  queryFn: () => (userId ? getMyConversations({ data: userId }) : null),
  enabled: userId !== undefined,
})

const GetConversationQueryDocument = graphql(`
  query getConversation($conversationId: String!) {
    aiConversation(conversationId: $conversationId) {
      id
      createdAt
      updatedAt
      assistants {
        id
        name
        assistantType
      }
      humans {
        id
        name
      }
    }
  }
`)

export const getConversation = createServerFn({ method: 'GET' })
  .validator((data: string) => data)
  .handler(async (ctx) =>
    backendRequest(GetConversationQueryDocument, { conversationId: ctx.data }),
  )

export const GetConversationQueryOptions = (conversationId?: string) => ({
  queryKey: [queryKeys.Conversation, conversationId],
  queryFn: () =>
    conversationId ? getConversation({ data: conversationId }) : null,
  enabled: conversationId !== undefined,
})

const GetConversationMessagesQueryDocument = graphql(`
  query getConversationMessages($conversationId: String!, $userId: String!) {
    aiConversationMessages(conversationId: $conversationId, userId: $userId) {
      id
      conversationId
      senderId
      createdAt
      updatedAt
      content
      sender {
        id
        name
        conversationId
      }
    }
  }
`)

export const getConversationMessages = createServerFn({ method: 'GET' })
  .validator((data: { conversationId: string; userId: string }) => data)
  .handler(async (ctx) =>
    backendRequest(GetConversationMessagesQueryDocument, ctx.data),
  )

export const GetMessagesQueryOptions = (
  conversationId?: string,
  userId?: string,
) => ({
  queryKey: [queryKeys.ConversationMessages, conversationId, userId],
  queryFn: () =>
    conversationId && userId
      ? getConversationMessages({ data: { conversationId, userId } })
      : null,
  enabled: conversationId !== undefined && userId !== undefined,
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
  .validator(
    (data: {
      content: string
      conversationId: string
      userId: string
      recipientAssistantIds: string[]
    }) => data,
  )
  .handler(async (ctx) =>
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
  mutation createConversation($data: AiConversationCreateInput!) {
    createAiConversation(data: $data) {
      id
    }
  }
`)

export const createConversation = createServerFn({ method: 'POST' })
  .validator((data: { userIds: string[]; assistantIds: string[] }) => data)
  .handler(async (ctx) =>
    backendRequest(CreateConversationDocument, {
      data: {
        assistantIds: ctx.data.assistantIds,
        userIds: ctx.data.userIds,
      },
    }),
  )

const DeleteConversationDocument = graphql(`
  mutation deleteConversation($conversationId: String!) {
    deleteAiConversation(conversationId: $conversationId) {
      id
    }
  }
`)

export const deleteConversation = createServerFn({ method: 'POST' })
  .validator((data: { conversationId: string }) => data)
  .handler(async (ctx) =>
    backendRequest(DeleteConversationDocument, {
      conversationId: ctx.data.conversationId,
    }),
  )
