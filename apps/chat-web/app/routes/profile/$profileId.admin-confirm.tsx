import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { useAuth } from '../../auth/auth'
import { toastError, toastSuccess } from '../../components/georgeToaster'
import { LoadingSpinner } from '../../components/loading-spinner'
import {
  UserProfileForm,
  UserProfileForm_UserProfileFragment,
  updateProfile,
} from '../../components/user/user-profile-form'
import { FragmentType } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { SaveIcon } from '../../icons/save-icon'
import { activateUserProfile, getUserProfile } from '../../server-functions/users'

export const Route = createFileRoute('/profile/$profileId/admin-confirm')({
  component: RouteComponent,
  loader: async ({ params }: { params: { profileId: string } }) => {
    const { profileId } = params
    return await getUserProfile({ data: { userId: profileId } })
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const { login } = useAuth()
  const navigate = useNavigate()
  const userProfile = useLoaderData({ strict: false })
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement | null>(null)

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateProfile({
        data: {
          formData,
          isAdmin: user?.isAdmin || false,
        },
      })
    },
    onSuccess: () => {
      toastSuccess('Profile updated successfully.')
    },
    onError: (error) => {
      toastError('Failed to update profile: ' + error.message)
    },
  })

  const activateProfileMutation = useMutation({
    mutationFn: async ({ profileId }: { profileId: string }) => {
      return await activateUserProfile({
        data: {
          profileId,
        },
      })
    },
    onSuccess: () => {
      toastSuccess('User profile activated successfully.')
    },
    onError: (error) => {
      toastError('Failed to activate profile: ' + error.message)
    },
  })

  if (!user) {
    return (
      <button
        type="button"
        className="btn btn-ghost"
        onClick={() => {
          localStorage.setItem('redirectAfterLogin', `/profile/${userProfile?.userProfile?.id}/admin-confirm`)
          login()
        }}
      >
        {t('actions.signInToActivateProfile')}
      </button>
    )
  }

  if (!user.isAdmin) {
    toastError('Access denied: Admins only')
    navigate({ to: '/' })
  }

  if (!userProfile?.userProfile) {
    toastError(t('errors.profileNotFound'))
    navigate({ to: '/' })
  }

  return (
    <article className="flex w-full flex-col items-center gap-4">
      <h1>{t('labels.adminProfileActivation')}</h1>
      <UserProfileForm
        userProfile={userProfile?.userProfile as FragmentType<typeof UserProfileForm_UserProfileFragment>}
        handleSendConfirmationMail={() => {}}
        onSubmit={(data) => {
          updateProfileMutation.mutate(data)
        }}
        formRef={formRef}
        isAdmin={true}
        saveButton={
          <div className="flex w-full gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm tooltip"
              data-tip={t('actions.save')}
              onClick={() => {
                if (formRef.current) {
                  const formData = new FormData(formRef.current)
                  updateProfileMutation.mutate(formData)
                }
              }}
            >
              <SaveIcon className="size-6" />
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() =>
                activateProfileMutation.mutate({
                  profileId: userProfile?.userProfile?.id || '',
                })
              }
            >
              {t('actions.activateProfile')}
            </button>
          </div>
        }
      />
      {updateProfileMutation.isPending && <LoadingSpinner isLoading={true} />}
      {activateProfileMutation.isPending && <LoadingSpinner isLoading={true} />}
    </article>
  )
}
