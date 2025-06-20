import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../gql'
import { queryKeys } from '../query-keys'
import { backendRequest } from './backend'

graphql(`
  fragment User on User {
    id
    username
    name
    createdAt
    email
    isAdmin
    profile {
      firstName
      lastName
      business
      position
      confirmationDate
      activationDate
    }
  }
`)

const UsersDocument = graphql(`
  query users {
    users {
      ...User
    }
  }
`)

export const getUsers = createServerFn({ method: 'GET' }).handler((ctx) =>
  backendRequest(UsersDocument, {
    userId: ctx.data,
  }),
)

export const getUsersQueryOptions = () =>
  queryOptions({
    queryKey: [queryKeys.Users],
    queryFn: () => getUsers(),
  })

const profileIdValidator = (data: { profileId: string }) => {
  return z
    .object({
      profileId: z.string().nonempty(),
    })
    .parse(data)
}

export const sendConfirmationMail = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      confirmationUrl: z.string().nonempty(),
      activationUrl: z.string().nonempty(),
    }),
  )
  .handler((ctx) =>
    backendRequest(
      graphql(`
        mutation sendConfirmationMail($confirmationUrl: String!, $activationUrl: String!) {
          sendConfirmationMail(confirmationUrl: $confirmationUrl, activationUrl: $activationUrl)
        }
      `),
      {
        confirmationUrl: ctx.data.confirmationUrl,
      },
    ),
  )

export const confirmUserProfile = createServerFn({ method: 'POST' })
  .validator(profileIdValidator)
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
graphql(`
  fragment UserProfile on UserProfile {
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
`)
export const getUserProfile = createServerFn({ method: 'GET' }).handler(async (ctx) => {
  const userProfileData = await backendRequest(
    graphql(`
      query getUserProfile {
        userProfile {
          ...UserProfile
        }
      }
    `),
    {
      userId: ctx.data,
    },
  )
  return userProfileData.userProfile
})

export const sendAdminNotificationMail = createServerFn({ method: 'POST' }).handler(async () => {
  const userProfile = await getUserProfile()

  if (!userProfile) {
    throw new Error('User profile not found')
  }

  await activateUserProfile({
    data: {
      profileId: userProfile.id,
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
  .validator(profileIdValidator)
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

export const AdminUserByIdDocument = graphql(`
  query adminUserById($email: String!) {
    user(email: $email) {
      ...User
      profile {
        ...UserProfileForm_UserProfile
      }
    }
  }
`)

export const getUserById = createServerFn({ method: 'GET' })
  .validator((data: string) => {
    return z.string().nonempty().parse(data)
  })
  .handler(async (ctx) => {
    // Get user details by email
    const getUserByEmail = async (email: string) => {
      return await backendRequest(AdminUserByIdDocument, { email })
    }

    // Try to find user in the regular users list (excludes current user)
    const { users } = await getUsers()
    const userSummary = users.find((user) => user.id === ctx.data)

    if (userSummary) {
      return await getUserByEmail(userSummary.email)
    }

    // If not found, check if user is requesting their own profile
    const currentUserProfile = await getUserProfile()
    if (currentUserProfile?.userId === ctx.data) {
      return await getUserByEmail(currentUserProfile.email)
    }

    throw new Error('User not found')
  })

export const getUserByIdQueryOptions = (userId: string) =>
  queryOptions({
    queryKey: [queryKeys.UserProfile, userId],
    queryFn: () => getUserById({ data: userId }),
  })
