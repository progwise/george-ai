import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useLinkProps } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { useAuth } from '../../auth/auth-hook'
import { LoadingSpinner } from '../../components/loading-spinner'
import { UserProfileForm } from '../../components/user/user-profile-form'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { TrashIcon } from '../../icons/trash-icon'
import { queryKeys } from '../../query-keys'
import { backendRequest } from '../../server-functions/backend'
import { sendConfirmationMail } from '../../server-functions/users'

const userProfileQueryDocument = graphql(/* GraphQL */ `
  query userProfile($userId: String!) {
    userProfile(userId: $userId) {
      id
      ...UserProfileForm_UserProfile
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

export const Route = createFileRoute('/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const auth = useAuth()

  const {
    data: userProfile,
    isLoading: userProfileIsLoading,
    refetch: refetchProfile,
  } = useSuspenseQuery({
    queryKey: [queryKeys.UserProfileForEdit, auth.user?.id],
    queryFn: async () => {
      if (!auth.user?.id) {
        return null
      }
      return await getUserProfile({ data: auth.user.id })
    },
  })

  const confirmationLink = useLinkProps({
    to: '/profile/$profileId/confirm',
    params: { profileId: userProfile?.userProfile?.id || 'no_profile_id' },
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.CurrentUserProfile, auth.user?.id] })
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
      queryClient.invalidateQueries({ queryKey: [queryKeys.CurrentUserProfile, auth.user?.id] })
    },
  })

  const { mutate: sendConfirmationMailMutation, isPending: sendConfirmationMailIsPending } = useMutation({
    mutationFn: async () => {
      if (!auth.user?.id) {
        throw new Error('No user id found')
      }
      return await sendConfirmationMail({
        data: {
          userId: auth.user.id,
          confirmationUrl: `${window.location.origin}${confirmationLink.href}` || 'no_link',
        },
      })
    },
    onSettled: () => {
      refetchProfile()
    },
  })

  if (!auth.user?.id) {
    return (
      <button type="button" className="btn btn-ghost" onClick={() => auth.login()}>
        {t('texts.signInForProfile')}
      </button>
    )
  }
  if (userProfileIsLoading) {
    return <LoadingSpinner />
  }
  if (!userProfile?.userProfile) {
    return (
      <article className="flex w-full flex-col items-center gap-4">
        <p>
          {t('texts.profileNotFoundFor')} {auth.user?.name}
        </p>
        <button type="button" className="btn btn-primary w-48" onClick={() => create()}>
          Create Profile
        </button>
      </article>
    )
  }

  const handleSendConfirmationMail = () => {
    sendConfirmationMailMutation()
  }

  return (
    <article className="flex w-full flex-col items-center gap-4">
      <p className="flex items-center gap-2">
        {t('texts.profileFoundFor')} {auth.user?.name}
        <button
          type="button"
          className="btn btn-circle btn-ghost btn-sm lg:tooltip lg:tooltip-bottom"
          onClick={() => remove()}
          data-tip={t('actions.removeProfile')}
        >
          <TrashIcon className="size-6" />
        </button>
      </p>
      <LoadingSpinner isLoading={createIsPending} message="Generating user profile" />
      <LoadingSpinner isLoading={removeIsPending} message="Removing user profile" />
      <LoadingSpinner isLoading={sendConfirmationMailIsPending} message="Sending email" />
      <UserProfileForm
        userProfile={userProfile.userProfile}
        handleSendConfirmationMail={handleSendConfirmationMail}
        saveButton={
          <button type="submit" className="btn btn-primary btn-sm">
            {t('actions.save')}
          </button>
        }
      />
    </article>
  )
}
