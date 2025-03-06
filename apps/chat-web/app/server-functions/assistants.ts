import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

const MyAssistantsDocument = graphql(/* GraphQL */ `
  query aiAssistantCards($ownerId: String!) {
    aiAssistants(ownerId: $ownerId) {
      id
      name
      description
      icon
      assistantType
      createdAt
      ownerId
    }
  }
`)

export const getMyAiAssistants = createServerFn({ method: 'GET' })
  .validator((ownerId: string) => z.string().nonempty().parse(ownerId))
  .handler((ctx) =>
    backendRequest(MyAssistantsDocument, {
      ownerId: ctx.data,
    }),
  )

export const myAiAssistantsQueryOptions = (ownerId?: string) => ({
  queryKey: [queryKeys.AiAssistants, ownerId],
  queryFn: () => (ownerId ? getMyAiAssistants({ data: ownerId }) : null),
  enabled: ownerId !== undefined,
})
