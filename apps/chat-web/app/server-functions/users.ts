import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

const myConversationUsersDocument = graphql(`
  query myConversationUsers($userId: String!) {
    myConversationUsers(userId: $userId) {
      id
      username
      name
      createdAt
      email
    }
  }
`)

export const getMyConversationUsers = createServerFn({ method: 'GET' })
  .validator((userId: string) => z.string().nonempty().parse(userId))
  .handler((ctx) =>
    backendRequest(myConversationUsersDocument, {
      userId: ctx.data,
    }),
  )

export const myConversationUsersQueryOptions = (userId?: string) => ({
  queryKey: [queryKeys.ConversationUsers, userId],
  queryFn: () => (userId ? getMyConversationUsers({ data: userId }) : null),
  enabled: userId !== undefined,
})
