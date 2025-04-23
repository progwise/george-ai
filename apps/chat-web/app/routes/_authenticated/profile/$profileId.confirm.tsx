import { createFileRoute, useNavigate } from '@tanstack/react-router'

import { toastSuccess } from '../../../components/georgeToaster'
import { LoadingSpinner } from '../../../components/loading-spinner'
import { confirmUserProfile } from '../../../server-functions/users'

export const Route = createFileRoute('/_authenticated/profile/$profileId/confirm')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { profileId } = params
    return await confirmUserProfile({ data: { profileId } })
  },
})

function RouteComponent() {
  const data = Route.useLoaderData()
  const navigate = useNavigate()
  if (data) {
    toastSuccess('Your profile has been confirmed!')
    navigate({ to: '/profile' })
  }
  return <LoadingSpinner message="Confirming your profile..." isLoading={true} />
}
