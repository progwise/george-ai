import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import React from 'react'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { LoadingSpinner } from '../../components/loading-spinner'
import { UserProfileForm } from '../../components/user/user-profile-form'
import { graphql } from '../../gql'
import { UserProfileInputSchema } from '../../gql/validation'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'

const userProfileQueryDocument = graphql(/* GraphQL */ `
  query userProfile($userId: String!) {
    userProfile(userId: $userId) {
      id
      ...UserProfileForm_userProfile
    }
  }
`)

export const getUserProfile = createServerFn({ method: 'GET' })
  .validator((userId: string) => {
    return z.string().nonempty().parse(userId)
  })
  .handler(async (ctx) => {
    return await backendRequest(userProfileQueryDocument, {
      userId: ctx.data,
    })
  })

const createUserProfileMutationDocument = graphql(/* GraphQL */ `
  mutation createUserProfile($userId: String!) {
    createUserProfile(userId: $userId) {
      id
    }
  }
`)

export const createUserProfile = createServerFn({ method: 'POST' })
  .validator((data: { userId: string }) => {
    return z
      .object({
        userId: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    return await backendRequest(createUserProfileMutationDocument, {
      userId: ctx.data.userId,
    })
  })

const removeUserProfileDocument = graphql(/* GraphQL */ `
  mutation removeUserProfile($userId: String!) {
    removeUserProfile(userId: $userId) {
      id
    }
  }
`)

export const removeUserProfile = createServerFn({ method: 'POST' })
  .validator((data: { userId: string }) => {
    return z
      .object({
        userId: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    return await backendRequest(removeUserProfileDocument, {
      userId: ctx.data.userId,
    })
  })

const saveUserProfileDocument = graphql(/* GraphQL */ `
  mutation saveUserProfile($userId: String!, $userProfileInput: UserProfileInput!) {
    updateUserProfile(userId: $userId, input: $userProfileInput) {
      id
    }
  }
`)

const saveUserProfile = createServerFn({ method: 'POST' })
  .validator((data: FormData) => {
    if (!(data instanceof FormData)) {
      throw new Error('Invalid form data')
    }
    const userId = z
      .string()
      .nonempty()
      .parse(data.get('userId') as string)

    const userProfileInput = UserProfileInputSchema().parse({
      business: data.get('business') as string,
      email: data.get('email') as string,
      family_name: data.get('family_name') as string,
      given_name: data.get('given_name') as string,
      position: data.get('position') as string,
    })

    return { userId, userProfileInput }
  })
  .handler(async (ctx) => {
    return await backendRequest(saveUserProfileDocument, ctx.data)
  })

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const auth = useAuth()

  const {
    data: userProfile,
    isLoading: userProfileIsLoading,
    refetch: refetchProfile,
  } = useSuspenseQuery({
    queryKey: [queryKeys.UserProfile, auth.user?.id],
    queryFn: async () => {
      if (!auth.user?.id) {
        return null
      }
      return await getUserProfile({ data: auth.user.id })
    },
  })

  const { mutate: create, isPending: createIsPending } = useMutation({
    mutationFn: async () => {
      if (!auth.user?.id) {
        throw new Error('No user id found')
      }
      return await createUserProfile({ data: { userId: auth.user.id } })
    },
    onSettled: () => {
      refetchProfile()
    },
  })

  const { mutate: remove, isPending: removeIsPending } = useMutation({
    mutationFn: async () => {
      if (!auth.user?.id) {
        throw new Error('No user id found')
      }
      return await removeUserProfile({ data: { userId: auth.user.id } })
    },
    onSettled: () => {
      refetchProfile()
    },
  })

  const { mutate: save, isPending: saveIsPending } = useMutation({
    mutationFn: async (data: FormData) => {
      if (!userProfile?.userProfile?.id) {
        throw new Error('Profile not found')
      }
      return await saveUserProfile({ data })
    },
    onSettled: () => {
      refetchProfile()
    },
  })

  if (userProfileIsLoading) {
    return <LoadingSpinner />
  }
  if (!userProfile?.userProfile) {
    return (
      <article className="flex w-full flex-col items-center gap-4">
        <p>No profile found for {auth.user?.name}</p>
        <button type="button" className="btn btn-primary w-48" onClick={() => create()}>
          Create Profile
        </button>
      </article>
    )
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    const data = new FormData(event.currentTarget)
    save(data)
  }
  return (
    <article className="flex w-full flex-col items-center gap-4">
      <p className="flex items-center gap-2">
        Profile found for {auth.user?.name}
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm lg:tooltip lg:tooltip-bottom"
          onClick={() => remove()}
          data-tip="Remove profile"
        >
          <TrashIcon className="size-6" />
        </button>
      </p>
      <LoadingSpinner isLoading={createIsPending} message="Generating user profile" />
      <LoadingSpinner isLoading={removeIsPending} message="Removing user profile" />
      <LoadingSpinner isLoading={saveIsPending} message="Saving user profile" />
      <UserProfileForm userProfile={userProfile.userProfile} handleSubmit={handleSubmit} />
    </article>
  )
}
