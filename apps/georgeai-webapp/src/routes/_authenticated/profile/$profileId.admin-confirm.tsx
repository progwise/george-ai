import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { AdminProfileEditor } from '../../../components/admin/users/admin-profile-editor'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { getUserById } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/profile/$profileId/admin-confirm')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { profileId } = params
    return await getUserById({ data: profileId })
  },
})

function RouteComponent() {
  const { user } = Route.useRouteContext()
  const navigate = useNavigate()
  const userData = Route.useLoaderData()
  const { t } = useTranslation()

  if (!userData?.user?.profile) {
    setTimeout(() => navigate({ to: '/' }), 300)
    return (
      <div
        className="mx-auto alert max-w-fit cursor-pointer py-2 text-sm alert-error"
        onClick={() => navigate({ to: '/' })}
      >
        {t('errors.profileNotFound')}. {t('actions.redirecting')}
      </div>
    )
  }

  if (!user.isAdmin) {
    setTimeout(() => navigate({ to: '/' }), 300)
    return (
      <div
        className="mx-auto alert max-w-fit cursor-pointer py-2 text-sm alert-error"
        onClick={() => navigate({ to: '/' })}
      >
        {t('errors.notAllowed')}. {t('actions.redirecting')}
      </div>
    )
  }

  return (
    <AdminProfileEditor profile={userData.user.profile} username={userData.user.username} email={userData.user.email} />
  )
}
