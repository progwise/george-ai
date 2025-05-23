import { queryOptions } from '@tanstack/react-query'
import { notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const assistantDetailsQueryDocument = graphql(`
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
`)

const getAssistant = createServerFn({ method: 'GET' })
  .validator(({ assistantId }: { assistantId: string }) => ({
    assistantId: z.string().nonempty().parse(assistantId),
  }))
  .handler(async (ctx) => {
    const result = await backendRequest(assistantDetailsQueryDocument, {
      id: ctx.data.assistantId,
    })
    if (!result.aiAssistant) {
      throw notFound()
    }
    return result
  })

export const getAssistantQueryOptions = (assistantId: string) =>
  queryOptions({
    queryKey: [queryKeys.AiAssistant, assistantId],
    queryFn: () => getAssistant({ data: { assistantId } }),
  })
