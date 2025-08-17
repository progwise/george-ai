import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRef } from 'react'

import { getProfileQueryOptions } from '../../../auth/get-profile-query'
import { UserProfileForm_UserProfileFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { SaveIcon } from '../../../icons/save-icon'
import { activateUserProfile } from '../../../server-functions/users'
import { toastError, toastSuccess } from '../../georgeToaster'
import { LoadingSpinner } from '../../loading-spinner'
import { UserProfileForm, updateProfile } from '../../user/user-profile-form'

interface AdminProfileEditorProps {
  profile: UserProfileForm_UserProfileFragment
  username?: string
  email?: string
  onSuccess?: () => void
  onActivationSuccess?: () => void
}

export function AdminProfileEditor({
  profile,
  username,
  email,
  onSuccess,
  onActivationSuccess,
}: AdminProfileEditorProps) {
  const { t } = useTranslation()
  const formRef = useRef<HTMLFormElement | null>(null)
  const queryClient = useQueryClient()

  const updateProfileMutation = useMutation({
    mutationFn: async (formData: FormData) => {
      return await updateProfile({
        data: {
          formData,
          isAdmin: true,
        },
      })
    },
    onSuccess: () => {
      toastSuccess('Profile updated successfully.')
      onSuccess?.()
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
      queryClient.invalidateQueries(getProfileQueryOptions())
      onActivationSuccess?.()
    },
    onError: (error) => {
      toastError('Failed to activate profile: ' + error.message)
    },
  })

  const handleSaveProfile = () => {
    if (formRef.current) {
      const formData = new FormData(formRef.current)
      updateProfileMutation.mutate(formData)
    }
  }

  const handleActivateProfile = () => {
    if (profile?.id) {
      activateProfileMutation.mutate({
        profileId: profile.id,
      })
    } else {
      toastError('Profile ID is missing.')
    }
  }

  return (
    <article className="flex w-full flex-col items-center gap-4">
      {username && email && (
        <h1 className="w-full break-words px-2 text-center">
          <div className="flex flex-col md:flex-row md:flex-wrap md:items-center md:justify-center">
            <span className="md:mr-1">{t('labels.adminProfileActivation')}:</span>
            <span className="font-medium">{username}</span>
            <span className="break-all text-sm font-normal md:ml-1 md:break-normal md:text-base">({email})</span>
          </div>
        </h1>
      )}
      <UserProfileForm
        userProfile={profile}
        onSubmit={(event) => {
          updateProfileMutation.mutate(new FormData(event.currentTarget))
        }}
        formRef={formRef}
        isAdmin={true}
        saveButton={
          <div className="flex w-full gap-2">
            <button
              type="button"
              className="btn btn-ghost btn-sm tooltip"
              data-tip={t('actions.save')}
              onClick={handleSaveProfile}
            >
              <SaveIcon className="size-6" />
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={handleActivateProfile}>
              {t('actions.activateProfile')}
            </button>
          </div>
        }
      />
      {(updateProfileMutation.isPending || activateProfileMutation.isPending) && <LoadingSpinner isLoading={true} />}
    </article>
  )
}
