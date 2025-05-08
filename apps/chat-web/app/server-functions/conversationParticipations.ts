import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { backendRequest } from './backend'

const AddConversationParticipantsDocument = graphql(`
  mutation addConversationParticipant($conversationId: String!, $userIds: [String!], $assistantIds: [String!]) {
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
    backendRequest(AddConversationParticipantsDocument, {
      conversationId: ctx.data.conversationId,
      userIds: ctx.data.userIds,
      assistantIds: ctx.data.assistantIds,
    }),
  )

const RemoveParticipantDocument = graphql(`
  mutation removeConversationParticipant($participantId: String!) {
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

const CreateConversationInvitationsMutation = graphql(`
  mutation createConversationInvitations(
    $conversationId: String!
    $inviterId: String!
    $data: [ConversationInvitationInput!]!
  ) {
    createConversationInvitations(conversationId: $conversationId, inviterId: $inviterId, data: $data) {
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
      inviterId: string
      data: {
        email: string
        allowDifferentEmailAddress: boolean
        allowMultipleParticipants: boolean
      }
    }) =>
      z
        .object({
          conversationId: z.string(),
          inviterId: z.string(),
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
      inviterId: ctx.data.inviterId,
      data: [ctx.data.data],
    })

    return conversationInvitation.createConversationInvitations
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
    const confirmationResult = await backendRequest(ConfirmInvitationDocument, {
      conversationId: ctx.data.conversationId,
      invitationId: ctx.data.invitationId,
      userId: ctx.data.userId,
      email: ctx.data.email ?? null,
    })

    return confirmationResult.confirmConversationInvitation
  })
