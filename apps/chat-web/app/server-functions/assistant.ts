import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

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
            aiLibraries(userId: $userId) {
              ...AssistantLibraries_Library
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
