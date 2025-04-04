import { useMutation } from '@tanstack/react-query'
import { createFileRoute, useLoaderData, useNavigate } from '@tanstack/react-router'

import { useAuth } from '../../auth/auth-hook'
import { LoadingSpinner } from '../../components/loading-spinner'
import { UserProfileForm, UserProfileForm_UserProfileFragment } from '../../components/user/user-profile-form'
import { FragmentType } from '../../gql'
import { adminConfirmUserProfile, getUserProfile, updateUserProfile } from '../../server-functions/users'

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

  const mutation = useMutation({
    mutationFn: async (data: { userId: string; userProfileInput: Record<string, unknown> }) => {
      return await updateUserProfile({ data })
    },
    onSuccess: () => {
      alert('Profile updated successfully!')
      navigate({ to: '/profile' })
    },
  })

  const confirmMutation = useMutation({
    mutationFn: async (profileId: string) => {
      return await adminConfirmUserProfile({
        data: {
          profileId,
        },
      })
    },
    onSettled: () => {
      alert('User profile confirmation process completed!')
      navigate({ to: '/profile' })
    },
  })

  if (auth.isLoading) {
    return <LoadingSpinner isLoading={true} />
  }

  if (!auth.user || !auth.user.isAdmin) {
    alert('Access denied: Admins only')
    navigate({ to: '/' })
    return null
  }

  return (
    <div>
      <h1>Admin Profile Confirmation</h1>
      <UserProfileForm
        userProfile={userProfile?.userProfile as FragmentType<typeof UserProfileForm_UserProfileFragment>}
        handleSendConfirmationMail={() => {}}
        onSubmit={(data) => {
          const userId = userProfile?.userProfile?.id || ''
          const userProfileInput = Object.fromEntries(data.entries())
          mutation.mutate({ userId, userProfileInput })
        }}
      />
      <button
        type="button"
        className="btn btn-primary"
        onClick={() => confirmMutation.mutate(userProfile?.userProfile?.id || '')}
      >
        Confirm user
      </button>
      {mutation.isPending && <LoadingSpinner isLoading={true} />}
      {confirmMutation.isPending && <LoadingSpinner isLoading={true} />}
    </div>
  )
}
