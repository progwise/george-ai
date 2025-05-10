import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

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
  .handler((ctx) => {
    const messageData = {
      content: ctx.data.content,
      conversationId: ctx.data.conversationId,
      recipientAssistantIds: ctx.data.recipientAssistantIds,
    }

    return backendRequest(CreateMessageDocument, {
      userId: ctx.data.userId,
      data: messageData,
    })
  })

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
