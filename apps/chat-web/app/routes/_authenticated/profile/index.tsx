import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useLinkProps } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import z from 'zod'

import { validateForm } from '@george-ai/web-utils'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { UserProfileForm, getFormSchema, updateProfile } from '../../../components/user/user-profile-form'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { TrashIcon } from '../../../icons/trash-icon'
import { queryKeys } from '../../../query-keys'
import { backendRequest } from '../../../server-functions/backend'
import { sendConfirmationMail } from '../../../server-functions/users'

const userProfileQueryDocument = graphql(`
  query userProfile {
    userProfile {
      id
      confirmationDate
      ...UserProfileForm_UserProfile
    }
  }
`)

export const getUserProfile = createServerFn({ method: 'GET' }).handler(async () => {
  return await backendRequest(userProfileQueryDocument)
})

const removeUserProfileDocument = graphql(`
  mutation removeUserProfile($profileId: String!) {
    removeUserProfile(profileId: $profileId) {
      id
    }
  }
`)

export const removeUserProfile = createServerFn({ method: 'POST' })
  .validator((data: { profileId: string }) => {
    return z
      .object({
        profileId: z.string().nonempty(),
      })
      .parse(data)
  })
  .handler(async (ctx) => {
    return await backendRequest(removeUserProfileDocument, {
      profileId: ctx.data.profileId,
    })
  })

export const Route = createFileRoute('/_authenticated/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const queryClient = useQueryClient()
  const { t, language } = useTranslation()
  const { user } = Route.useRouteContext()

  const formSchema = getFormSchema(language)

  const {
    data: userProfile,
    isLoading: userProfileIsLoading,
    refetch: refetchProfile,
  } = useSuspenseQuery({
    queryKey: [queryKeys.UserProfileForEdit, user.id],
    queryFn: () => getUserProfile(),
  })

  const confirmationLink = useLinkProps({
    to: '/profile/$profileId/confirm',
    params: { profileId: userProfile.userProfile?.id || 'no_profile_id' },
  })

  const { mutate: removeProfileMutation, isPending: removeProfileIsPending } = useMutation({
    mutationFn: async () => removeUserProfile({ data: { profileId: userProfile?.userProfile?.id || 'no_profile_id' } }),
    onSettled: () => {
      toastSuccess(t('texts.removedProfile'))
      refetchProfile()
      queryClient.invalidateQueries(getProfileQueryOptions())
    },
    onError: (error) => {
      toastError('Failed to remove profile: ' + error.message)
    },
  })

  const { mutate: sendConfirmationMailMutation, isPending: sendConfirmationMailIsPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      // Update the profile
      await updateProfile({
        data: {
          formData,
          isAdmin: user.isAdmin,
        },
      })

      // Send the confirmation email
      return await sendConfirmationMail({
        data: {
          confirmationUrl: `${window.location.origin}${confirmationLink.href}` || 'no_link',
        },
      })
    },
    onSuccess: () => {
      toastSuccess(t('texts.sentConfirmationMail'))
      refetchProfile()
    },
    onError: (error) => {
      toastError('Failed to send confirmation email: ' + error.message)
    },
  })

  const handleSendConfirmationMail = (formData: FormData) => {
    const formValidation = validateForm({ formData, formSchema })
    if (formValidation.errors.length < 1) {
      sendConfirmationMailMutation(formData)
    } else {
      toastError(formValidation.errors.join('\n'))
    }
  }

  const handleSaveChanges = async (formData: FormData) => {
    const formValidation = validateForm({ formData, formSchema })
    if (formValidation.errors.length < 1) {
      await updateProfile({
        data: {
          formData,
          isAdmin: user.isAdmin,
        },
      })
      toastSuccess(t('texts.profileSaved'))
      refetchProfile()
    } else {
      toastError(formValidation.errors.join('\n'))
    }
  }

  const handleFormSubmission = (formData: FormData) => {
    if (userProfile?.userProfile?.confirmationDate) {
      handleSaveChanges(formData)
    } else {
      handleSendConfirmationMail(formData)
    }
  }

  const handleFormSubmit = (formData: FormData) => {
    handleFormSubmission(formData)
  }

  const handleButtonClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const form = event.currentTarget.closest('form') as HTMLFormElement
    const formData = new FormData(form)
    handleFormSubmission(formData)
  }

  const isLoading = userProfileIsLoading || sendConfirmationMailIsPending || removeProfileIsPending

  if (isLoading) {
    return <LoadingSpinner isLoading={true} />
  }

  return (
    <article className="flex w-full flex-col items-center gap-4">
      <p className="flex items-center gap-2">
        {t('texts.profileFoundFor')} {user?.name}
        <button
          type="button"
          className="btn btn-ghost btn-sm btn-circle lg:tooltip lg:tooltip-bottom"
          onClick={() => {
            removeProfileMutation()
          }}
          data-tip={t('tooltips.removeProfile')}
        >
          <TrashIcon className="size-6" />
        </button>
      </p>
      {userProfile?.userProfile && (
        <UserProfileForm
          userProfile={userProfile.userProfile}
          onSubmit={(formData: FormData) => {
            handleFormSubmit(formData)
          }}
          saveButton={
            <button
              type="button"
              className="btn btn-primary btn-sm tooltip"
              data-tip={
                !userProfile.userProfile.confirmationDate ? t('tooltips.saveAndSendConfirmationMail') : undefined
              }
              onClick={(event) => {
                handleButtonClick(event)
              }}
            >
              {userProfile.userProfile.confirmationDate ? t('actions.save') : t('actions.sendConfirmationMail')}
            </button>
          }
        />
      )}
    </article>
  )
}
