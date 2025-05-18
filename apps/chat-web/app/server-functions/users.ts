import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { UsersQuery } from '../gql/graphql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

const UsersDocument = graphql(`
  query users {
    users {
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

export const getUsers = createServerFn({ method: 'GET' }).handler(() => {
  return backendRequest(UsersDocument)
})
export const getUsersQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Users],
    queryFn: () => getUsers(),
  })

export const sendConfirmationMail = createServerFn({ method: 'POST' })
  .validator((data: { confirmationUrl: string }) => {
    return z
      .object({
        confirmationUrl: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation sendConfirmationMail($confirmationUrl: String!) {
          sendConfirmationMail(confirmationUrl: $confirmationUrl)
        }
      `),
      {
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

export const getUserProfile = createServerFn({ method: 'GET' }).handler((ctx) =>
  backendRequest(
    graphql(`
      query getUserProfile {
        userProfile {
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
      profileId: ctx.data,
    },
  ),
)

export const sendAdminNotificationMail = createServerFn({ method: 'POST' }).handler(async () => {
  const userProfile = await getUserProfile()

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
  .validator((data: { profileId: string; userProfileInput: { freeMessages?: number; freeStorage?: number } }) => {
    return z
      .object({
        profileId: z.string().nonempty(),
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
        mutation updateUserProfile($profileId: String!, $userProfileInput: UserProfileInput!) {
          updateUserProfile(profileId: $profileId, input: $userProfileInput) {
            id
          }
        }
      `),
      {
        profileId: ctx.data.profileId,
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
