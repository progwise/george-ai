import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

graphql(`
  fragment AssistantBase on AiAssistant {
    id
    name
    description
    iconUrl
    updatedAt
    ownerId
  }
`)

const assistantsDocument = graphql(`
  query aiAssistantCards {
    aiAssistants {
      ...AssistantBase
    }
  }
`)

const getAiAssistants = createServerFn({ method: 'GET' }).handler(() => backendRequest(assistantsDocument))

export const getAiAssistantsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.AiAssistants],
    queryFn: () => getAiAssistants(),
  })
