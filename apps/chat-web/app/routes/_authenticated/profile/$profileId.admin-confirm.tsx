import { useMutation } from '@tanstack/react-query'
import { Navigate, createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'
import { useRef } from 'react'

import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { UserProfileForm, updateProfile } from '../../../components/user/user-profile-form'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { SaveIcon } from '../../../icons/save-icon'
import { activateUserProfile, getUserProfile } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/profile/$profileId/admin-confirm')({
  component: RouteComponent,
  loader: () => getUserProfile(),
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const userProfile = useLoaderData({ strict: false })
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement | null>(null)

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateProfile({
        data: {
          formData,
          isAdmin: user.isAdmin,
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

  if (!user.isAdmin) {
    setTimeout(() => navigate({ to: '/' }), 300)
    return (
      <div
        className="alert alert-error mx-auto max-w-fit cursor-pointer py-2 text-sm"
        onClick={() => navigate({ to: '/' })}
      >
        {t('errors.notAllowed')}. {t('actions.redirecting')}
      </div>
    )
  }

  if (!userProfile?.userProfile) {
    toastError(t('errors.profileNotFound'))
    return <Navigate to="/" />
  }

  return (
    <article className="flex w-full flex-col items-center gap-4">
      <h1>{t('labels.adminProfileActivation')}</h1>
      <UserProfileForm
        userProfile={userProfile.userProfile}
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
