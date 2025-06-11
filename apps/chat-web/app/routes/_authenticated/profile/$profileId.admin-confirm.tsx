import { Navigate, createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'

import { toastError } from '../../../components/georgeToaster'
import { AdminProfileEditor } from '../../../components/user/admin-profile-editor'
import { UserProfileForm_UserProfileFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getUserProfile } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/profile/$profileId/admin-confirm')({
  component: RouteComponent,
  loader: () => getUserProfile(),
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const userProfileData = useLoaderData({ strict: false })
  const { t } = useTranslation()

  const userProfile =
    userProfileData && userProfileData.__typename === 'UserProfile'
      ? (userProfileData as UserProfileForm_UserProfileFragment)
      : null

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

  if (!userProfile) {
    toastError(t('errors.profileNotFound'))
    return <Navigate to="/" />
  }

  return <AdminProfileEditor profile={userProfile} />
}
