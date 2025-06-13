import { useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'

import { AdminProfileEditor } from '../../../../components/user/admin-profile-editor'
import { useTranslation } from '../../../../i18n/use-translation-hook'
import { BackIcon } from '../../../../icons/back-icon'
import { queryKeys } from '../../../../query-keys'
import { getUserById } from '../../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/admins/users/$userId')({
  beforeLoad: ({ context }) => {
    if (!context.user?.isAdmin) {
      throw notFound()
    }
    return {}
  },
  component: AdminUserDetail,
})

function AdminUserDetail() {
  const { userId } = Route.useParams()
  const navigate = useNavigate()
  const { t } = useTranslation()

  const { data } = useSuspenseQuery({
    queryKey: [queryKeys.UserProfile, userId],
    queryFn: () => getUserById({ data: userId }),
  })

  const userData = data?.user

  if (!userData || !userData.profile) {
    setTimeout(() => navigate({ to: '/admins/users' }), 300)
    return (
      <div
        className="alert alert-error mx-auto max-w-fit cursor-pointer py-2 text-sm"
        onClick={() => navigate({ to: '/admins/users' })}
      >
        {t('errors.profileNotFound')}. {t('actions.redirecting')}
      </div>
    )
  }

  return (
    <div className="px-2 md:px-4">
      <div className="mb-4 flex items-center">
        <Link to="/admins/users" className="btn btn-ghost btn-sm gap-2">
          <BackIcon />
          Back to Users
        </Link>
      </div>

      <AdminProfileEditor profile={userData.profile} username={userData.username} email={userData.email} />
    </div>
  )
}
