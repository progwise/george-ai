import { createServerFn } from '@tanstack/react-start'
import { graphql } from '../gql'
import { z } from 'zod'
import { backendRequest } from './backend'
import { queryKeys } from '../query-keys'

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
