import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'

import { AdminProfileEditor } from '../../../../components/admin/users/admin-profile-editor'
import { ensureUserProfile } from '../../../../components/admin/users/ensure-user-profile'
import { toastError, toastSuccess } from '../../../../components/georgeToaster'
import { LoadingSpinner } from '../../../../components/loading-spinner'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { queryKeys } from '../../../../query-keys'
import { getUserById } from '../../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/admin/users/$userId')({
  component: AdminUserDetail,
})

function AdminUserDetail() {
  const { userId } = Route.useParams()
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  const { data } = useSuspenseQuery({
    queryKey: [queryKeys.UserProfile, userId],
    queryFn: () => getUserById({ data: userId }),
  })

  const { mutate: ensureUserProfileMutation, isPending } = useMutation({
    mutationFn: async () => {
      return await ensureUserProfile({ data: { userId } })
    },
    onSuccess: () => {
      toastSuccess(t('notifications.profileEnsured', { userId }))
    },
    onError: (error) => {
      toastError(t('errors.profileEnsureFailed', { userId, error: error.message }))
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.UserProfile, userId] })
    },
  })

  const userData = data?.user

  if (!userData || !userData.profile) {
    return (
      <div className="alert alert-error mx-auto max-w-fit cursor-pointer py-2 text-sm">
        {t('errors.profileNotFound')} for user {userId}
        <button type="button" className="btn btn-sm btn-primary" onClick={() => ensureUserProfileMutation()}>
          {t('actions.ensureUserProfile')}
        </button>
      </div>
    )
  }

  if (isPending) {
    return <LoadingSpinner />
  }

  return <AdminProfileEditor profile={userData.profile} username={userData.username} email={userData.email} />
}
