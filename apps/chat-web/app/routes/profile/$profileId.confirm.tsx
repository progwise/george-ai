import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'

import { LoadingSpinner } from '../../components/loading-spinner'
import { confirmUserProfile } from '../../server-functions/users'

export const Route = createFileRoute('/profile/$profileId/confirm')({
  component: RouteComponent,
  loader: async ({ params }) => {
    const { profileId } = params
    return await confirmUserProfile({ data: { profileId } })
  },
})

function RouteComponent() {
  const data = useLoaderData({ strict: false })
  const navigate = useNavigate()
  if (data) {
    alert('Your profile has been confirmed!')
    navigate({ to: '/profile' })
  }
  return <LoadingSpinner message="Confirming your profile..." isLoading={true} />
}
