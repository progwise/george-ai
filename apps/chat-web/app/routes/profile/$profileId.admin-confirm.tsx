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
      alert('Profile updated successfully.')
    },
    onError: (error) => {
      alert('Failed to update profile: ' + error.message)
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
    onSuccess: () => {
      alert('User profile confirmation process completed.')
    },
    onError: (error) => {
      alert('Failed to confirm profile: ' + error.message)
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

  if (!userProfile?.userProfile) {
    return (
      <div className="flex flex-col items-center gap-4">
        <h1>User profile not found</h1>
        <p>The profile you are trying to confirm does not exist or has been deleted.</p>
        <button type="button" className="btn btn-primary btn-sm" onClick={() => navigate({ to: '/' })}>
          Go Back
        </button>
      </div>
    )
  }

  return (
    <div>
      <h1>Admin Profile Confirmation</h1>
      <UserProfileForm
        userProfile={userProfile?.userProfile as FragmentType<typeof UserProfileForm_UserProfileFragment>}
        handleSendConfirmationMail={() => {}}
        onSubmit={(data) => {
          const userId = userProfile?.userProfile?.userId || ''
          const userProfileInput = Object.fromEntries(data.entries())
          delete userProfileInput.userId
          mutation.mutate({ userId, userProfileInput })
        }}
        isEditable={true}
      />
      <button
        type="button"
        className="btn btn-primary btn-sm"
        onClick={() => confirmMutation.mutate(userProfile?.userProfile?.userId || '')}
      >
        Confirm user profile
      </button>
      {mutation.isPending && <LoadingSpinner isLoading={true} />}
      {confirmMutation.isPending && <LoadingSpinner isLoading={true} />}
    </div>
  )
}
