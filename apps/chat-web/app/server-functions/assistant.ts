import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

graphql(`
  fragment AssistantBase on AiAssistant {
    id
    name
    description
    iconUrl
    updatedAt
  }
`)

const getAiAssistants = createServerFn({ method: 'GET' })
  .validator((userId: string) => z.string().nonempty().parse(userId))
  .handler((ctx) =>
    backendRequest(
      graphql(`
        query aiAssistantCards($userId: String!) {
          aiAssistants(userId: $userId) {
            ...AssistantBase
          }
        }
      `),
      {
        userId: ctx.data,
      },
    ),
  )

export const getAiAssistantsQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiAssistants, userId],
    queryFn: async () => {
      return getAiAssistants({ data: userId })
    },
  })

export const getAssistant = createServerFn({ method: 'GET' })
  .validator(({ assistantId, userId, ownerId }: { assistantId: string; userId: string; ownerId: string }) => ({
    assistantId: z.string().nonempty().parse(assistantId),
    userId: z.string().nonempty().parse(userId),
    ownerId: z.string().nonempty().parse(ownerId),
  }))
  .handler(
    async (ctx) =>
      await backendRequest(
        graphql(`
          query aiAssistantDetails($id: String!, $userId: String!, $ownerId: String!) {
            aiAssistant(id: $id) {
              ...AssistantForm_Assistant
              ...AssistantSelector_Assistant
              ...AssistantLibraries_Assistant
              ...AssistantBasecaseForm_Assistant
              ...AssistantParticipants_Assistant
            }
            aiAssistants(userId: $userId) {
              ...AssistantSelector_Assistant
            }
            aiLibraryUsage(assistantId: $id) {
              ...AssistantLibraries_LibraryUsage
            }
          }
        `),
        {
          id: ctx.data.assistantId,
          userId: ctx.data.userId,
          ownerId: ctx.data.ownerId,
        },
      ),
  )

export const getAssistantQueryOptions = (assistantId: string, userId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiAssistant, assistantId, userId],
    queryFn: () => getAssistant({ data: { assistantId, userId, ownerId: userId } }),
  })

const AssignableAssistantsDocument = graphql(`
  query getAssignableAssistants($userId: String!) {
    aiAssistants(userId: $userId) {
      ...NewConversationSelector_Assistant
      ...ConversationParticipants_Assistant
      ...ConversationParticipantsDialog_Assistant
    }
  }
`)

export const getAssignableAssistants = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) => z.object({ userId: z.string() }).parse(data))
  .handler(async (ctx) => backendRequest(AssignableAssistantsDocument, ctx.data))

// export const getAssignableAssistantsQueryOptions = (userId: string) =>
//   queryOptions({
//     queryKey: [queryKeys.ConversationAssignableAssistants, userId],
//     queryFn: () => getAssignableAssistants({ data: { userId } }),
//   })
