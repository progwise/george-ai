import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddParticipantsDocument = graphql(`
  mutation addParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {
    addConversationParticipants(conversationId: $conversationId, userIds: $userIds, assistantIds: $assistantIds) {
      id
    }
  }
`)

export const addConversationParticipants = createServerFn({ method: 'POST' })
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
    backendRequest(AddParticipantsDocument, {
      conversationId: ctx.data.conversationId,
      userIds: ctx.data.userIds,
      assistantIds: ctx.data.assistantIds,
    }),
  )

const RemoveParticipantDocument = graphql(`
  mutation removeParticipant($participantId: String!) {
    removeConversationParticipant(id: $participantId) {
      id
    }
  }
`)

export const removeConversationParticipant = createServerFn({ method: 'POST' })
  .validator((data: { participantId: string }) => z.object({ participantId: z.string() }).parse(data))
  .handler((ctx) =>
    backendRequest(RemoveParticipantDocument, {
      participantId: ctx.data.participantId,
    }),
  )

const CreateConversationInvitationMutation = graphql(`
  mutation createConversationInvitation(
    $conversationId: String!
    $inviterId: String!
    $data: ConversationInvitationInput!
  ) {
    createConversationInvitation(conversationId: $conversationId, inviterId: $inviterId, data: $data) {
      id
      email
      date
      confirmationDate
      allowDifferentEmailAddress
      allowMultipleParticipants
      link
    }
  }
`)

export const createConversationInvitation = createServerFn({ method: 'POST' })
  .validator(
    (data: {
      conversationId: string
      inviterId: string
      data: {
        email: string
        allowDifferentEmailAddress: boolean
        allowMultipleParticipants: boolean
        language?: string
      }
    }) =>
      z
        .object({
          conversationId: z.string(),
          inviterId: z.string(),
          data: z.object({
            email: z.string().email(),
            allowDifferentEmailAddress: z.boolean(),
            allowMultipleParticipants: z.boolean(),
            language: z.string().optional(),
          }),
        })
        .parse(data),
  )
  .handler(async (ctx) => {
    const conversationInvitation = await backendRequest(CreateConversationInvitationMutation, {
      conversationId: ctx.data.conversationId,
      inviterId: ctx.data.inviterId,
      data: ctx.data.data,
    })

    return conversationInvitation.createConversationInvitation
  })

const ConfirmInvitationDocument = graphql(`
  mutation confirmInvitation($conversationId: String!, $invitationId: String!, $userId: String!, $email: String) {
    confirmConversationInvitation(
      conversationId: $conversationId
      invitationId: $invitationId
      userId: $userId
      email: $email
    ) {
      id
    }
  }
`)

export const confirmInvitation = createServerFn({ method: 'POST' })
  .validator((data: { conversationId: string; invitationId: string; userId: string; email?: string }) =>
    z
      .object({
        conversationId: z.string(),
        invitationId: z.string(),
        userId: z.string(),
        email: z.string().email().optional(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    return await backendRequest(ConfirmInvitationDocument, {
      conversationId: ctx.data.conversationId,
      invitationId: ctx.data.invitationId,
      userId: ctx.data.userId,
      email: ctx.data.email ?? null,
    })
  })
