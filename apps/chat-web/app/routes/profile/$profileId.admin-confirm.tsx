import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'

import { useAuth } from '../../auth/auth-hook'
import { toastError, toastSuccess } from '../../components/georgeToaster'
import { LoadingSpinner } from '../../components/loading-spinner'
import {
  UserProfileForm,
  UserProfileForm_UserProfileFragment,
  updateProfile,
} from '../../components/user/user-profile-form'
import { FragmentType } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { activateUserProfile, getUserProfile } from '../../server-functions/users'

export const Route = createFileRoute('/profile/$profileId/admin-confirm')({
  component: RouteComponent,
  loader: async ({ params }: { params: { profileId: string } }) => {
    const { profileId } = params
    return await getUserProfile({ data: { userId: profileId } })
  },
})

function RouteComponent() {
  const auth = useAuth()
  const navigate = useNavigate()
  const userProfile = useLoaderData({ strict: false })
  const { t } = useTranslation()

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateProfile({ data: formData })
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

  if (auth.isLoading) {
    return <LoadingSpinner isLoading={true} />
  }

  if (!auth.user || !auth.user.isAdmin) {
    toastError('Access denied: Admins only')
    navigate({ to: '/' })
    return null
  }

  if (!userProfile?.userProfile) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h1>User profile not found</h1>
        <p>The profile you are trying to activate does not exist or has been deleted.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate({ to: '/' })}>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <article className="flex w-full flex-col items-center gap-4">
      <h1>Admin Profile Activation</h1>
      <UserProfileForm
        userProfile={userProfile?.userProfile as FragmentType<typeof UserProfileForm_UserProfileFragment>}
        handleSendConfirmationMail={() => {}}
        onSubmit={(data) => {
          updateProfileMutation.mutate(data)
        }}
        isEditable={true}
        saveButton={
          <div className="flex w-full justify-between">
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
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => {
                const formData = new FormData(document.querySelector('form')!)
                updateProfileMutation.mutate(formData)
              }}
            >
              {t('actions.save')}
            </button>
          </div>
        }
      />
      {updateProfileMutation.isPending && <LoadingSpinner isLoading={true} />}
      {activateProfileMutation.isPending && <LoadingSpinner isLoading={true} />}
    </article>
  )
}
