import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useLinkProps } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { validateForm } from '@george-ai/web-utils'

import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { UserProfileForm, getFormSchema, updateProfile } from '../../../components/user/user-profile-form'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
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

export const Route = createFileRoute('/_authenticated/profile/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t, language } = useTranslation()
  const { user } = Route.useRouteContext()

  const formSchema = getFormSchema(language)

  const {
    data: userProfile,
    isLoading: userProfileIsLoading,
    refetch: refetchProfile,
  } = useSuspenseQuery({
    queryKey: [queryKeys.UserProfile, user.id],
    queryFn: () => getUserProfile(),
  })

  const confirmationLink = useLinkProps({
    to: '/profile/$profileId/confirm',
    params: { profileId: userProfile.userProfile?.id || 'no_profile_id' },
  })

  const { mutate: sendConfirmationMailMutation, isPending: sendConfirmationMailIsPending } = useMutation({
    mutationFn: async (formData: FormData) => {
      await updateProfile({
        data: {
          formData,
          isAdmin: user.isAdmin,
        },
      })

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
    if (userProfile.userProfile?.confirmationDate) {
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

  const isLoading = userProfileIsLoading || sendConfirmationMailIsPending

  if (isLoading) {
    return <LoadingSpinner isLoading={true} />
  }

  return (
    <article className="flex w-full flex-col items-center gap-4">
      {userProfile.userProfile ? (
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
      ) : (
        <div>No user profile</div>
      )}
    </article>
  )
}
