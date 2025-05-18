import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

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
            aiAssistants {
              ...AssistantSelector_Assistant
            }
            aiLibraryUsage(assistantId: $id) {
              ...AssistantLibraries_LibraryUsage
            }
            aiLibraries {
              ...AssistantLibraries_Library
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

const AssignableAssistantsDocument = graphql(`
  query getAssignableAssistants {
    aiAssistants {
      ...NewConversationSelector_Assistant
      ...ConversationParticipants_Assistant
      ...ConversationParticipantsDialogButton_Assistant
    }
  }
`)

export const getAssignableAssistants = createServerFn({ method: 'GET' }).handler(async () =>
  backendRequest(AssignableAssistantsDocument),
)

export const getAssignableAssistantsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.ConversationAssignableAssistants],
    queryFn: () => getAssignableAssistants(),
  })
