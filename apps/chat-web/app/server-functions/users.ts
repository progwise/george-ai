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

export const sendConfirmationMail = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; confirmationUrl: string }) => {
    return z
      .object({
        userId: z.string().nonempty(),
        confirmationUrl: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation sendConfirmationMail($userId: String!, $confirmationUrl: String!) {
          sendConfirmationMail(userId: $userId, confirmationUrl: $confirmationUrl)
        }
      `),
      {
        userId: ctx.data.userId,
        confirmationUrl: ctx.data.confirmationUrl,
      },
    ),
  )

export const confirmUserProfile = createServerFn({ method: 'POST' })
  .validator((data: { profileId: string }) => {
    return z
      .object({
        profileId: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation confirmUserProfile($profileId: String!) {
          confirmUserProfile(profileId: $profileId) {
            id
          }
        }
      `),
      {
        profileId: ctx.data.profileId,
      },
    ),
  )

export const getUserProfile = createServerFn({ method: 'GET' })
  .validator((data: { userId: string }) => z.string().nonempty().parse(data.userId))
  .handler((ctx) =>
    backendRequest(
      graphql(`
        query getUserProfile($userId: String!) {
          userProfile(userId: $userId) {
            id
            email
            firstName
            lastName
            business
            position
            freeMessages
            usedMessages
            freeStorage
            usedStorage
          }
        }
      `),
      {
        userId: ctx.data,
      },
    ),
  )
