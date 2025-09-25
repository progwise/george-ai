import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'

import { graphql } from '../../gql'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

graphql(`
  fragment ConversationBase on AiConversation {
    id
    ownerId
    createdAt
    updatedAt
  }
`)

const ConversationsQueryDocument = graphql(`
  query getUserConversations {
    aiConversations {
      id
      ...ConversationSelector_Conversation
    }
  }
`)

export const getConversations = createServerFn({ method: 'GET' }).handler(async (ctx) =>
  backendRequest(ConversationsQueryDocument, ctx.data),
)

export const getConversationsQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Conversations],
    queryFn: () => getConversations(),
  })
