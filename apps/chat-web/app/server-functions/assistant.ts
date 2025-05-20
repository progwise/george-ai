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
  .validator(({ assistantId }: { assistantId: string }) => ({
    assistantId: z.string().nonempty().parse(assistantId),
  }))
  .handler(
    async (ctx) =>
      await backendRequest(
        graphql(`
          query aiAssistantDetails($id: String!) {
            aiAssistant(id: $id) {
              ...AssistantForm_Assistant
              ...AssistantSelector_Assistant
              ...AssistantLibraries_Assistant
              ...AssistantBasecaseForm_Assistant
              ...AssistantParticipants_Assistant
            }
            aiLibraryUsage(assistantId: $id) {
              ...AssistantLibraries_LibraryUsage
            }
          }
        `),
        {
          id: ctx.data.assistantId,
        },
      ),
  )

export const getAssistantQueryOptions = (assistantId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiAssistant, assistantId],
    queryFn: () => getAssistant({ data: { assistantId } }),
  })
