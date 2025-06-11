import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, notFound } from '@tanstack/react-router'

import { AdminProfileEditor } from '../../../../components/user/admin-profile-editor'
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

  const { data } = useSuspenseQuery({
    queryKey: [queryKeys.UserProfile, userId],
    queryFn: () => getUserById({ data: userId }),
  })

  const userData = data?.user

  if (!userData || !userData.profile) {
    throw notFound()
  }

  return <AdminProfileEditor profile={userData.profile} username={userData.username} email={userData.email} />
}
