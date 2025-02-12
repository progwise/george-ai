import { createServerFn } from '@tanstack/start'
import { graphql } from '../gql'
import { z } from 'zod'
import { backendRequest } from './backend'
import { queryKeys } from '../query-keys'

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
  .handler(async (ctx) =>
    backendRequest(MyAssistantsDocument, {
      ownerId: ctx.data,
    }),
  )

export const myAiAssistantsQueryOptions = (ownerId?: string) => ({
  queryKey: [queryKeys.AiAssistants, ownerId],
  queryFn: () => (ownerId ? getMyAiAssistants({ data: ownerId }) : null),
  enabled: ownerId !== undefined,
})
