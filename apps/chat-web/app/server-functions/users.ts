import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { UsersQuery } from '../gql/graphql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

const UsersDocument = graphql(`
  query users($userId: String!) {
    users(userId: $userId) {
      id
      username
      name
      createdAt
      email
      profile {
        firstName
        lastName
        business
        position
      }
    }
  }
`)

export type User = UsersQuery['users'][0]

export const getUsers = createServerFn({ method: 'GET' })
  .validator((userId: string) => z.string().nonempty().parse(userId))
  .handler((ctx) =>
    backendRequest(UsersDocument, {
      userId: ctx.data,
    }),
  )

export const getUsersQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [queryKeys.Users, userId],
    queryFn: () => getUsers({ data: userId }),
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
            userId
            email
            firstName
            lastName
            business
            position
            freeMessages
            usedMessages
            freeStorage
            usedStorage
            createdAt
            updatedAt
            confirmationDate
            activationDate
            expiresAt
          }
        }
      `),
      {
        userId: ctx.data,
      },
    ),
  )

export const sendAdminNotificationMail = createServerFn({ method: 'POST' })
  .validator((data: { userId: string }) => {
    return z
      .object({
        userId: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    const userProfile = await getUserProfile({ data: { userId: ctx.data.userId } })

    if (!userProfile?.userProfile) {
      throw new Error('User profile not found')
    }

    await activateUserProfile({
      data: {
        profileId: userProfile.userProfile.id,
      },
    })

    return { success: true }
  })

export const updateUserProfile = createServerFn({ method: 'POST' })
  .validator((data: { userId: string; userProfileInput: { freeMessages?: number; freeStorage?: number } }) => {
    return z
      .object({
        userId: z.string().nonempty(),
        userProfileInput: z.object({
          freeMessages: z.number().optional(),
          freeStorage: z.number().optional(),
        }),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    const userProfileInput = {
      ...ctx.data.userProfileInput,
      freeMessages: ctx.data.userProfileInput.freeMessages ?? 0,
      freeStorage: ctx.data.userProfileInput.freeStorage ?? 0,
    }

    return backendRequest(
      graphql(`
        mutation updateUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {
          updateUserProfile(userId: $userId, input: $userProfileInput) {
            id
          }
        }
      `),
      {
        userId: ctx.data.userId,
        userProfileInput,
      },
    )
  })

export const activateUserProfile = createServerFn({ method: 'POST' })
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
        mutation activateUserProfile($profileId: String!) {
          activateUserProfile(profileId: $profileId) {
            id
          }
        }
      `),
      {
        profileId: ctx.data.profileId,
      },
    ),
  )
