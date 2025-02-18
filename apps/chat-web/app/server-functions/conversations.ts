import { createServerFn } from '@tanstack/start'
import { graphql } from '../gql'
import { backendRequest } from './backend'

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
