import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'

import { toastError, toastSuccess } from '../../components/georgeToaster'
import { useWorkspace } from '../../components/workspace/use-workspace'
import { graphql } from '../../gql'
import { useTranslation } from '../../i18n/use-translation-hook'
import { backendRequest } from '../../server-functions/backend'

const workspaceInvitationQueryDocument = graphql(`
  query WorkspaceInvitation($id: ID!) {
    workspaceInvitation(id: $id) {
      id
      email
      expiresAt
      acceptedAt
      workspace {
        id
        name
      }
      inviter {
        name
        email
      }
    }
  }
`)

const acceptWorkspaceInvitationMutationDocument = graphql(`
  mutation AcceptWorkspaceInvitation($invitationId: ID!) {
    acceptWorkspaceInvitation(invitationId: $invitationId) {
      id
      workspace {
        id
        name
      }
    }
  }
`)

const getWorkspaceInvitation = createServerFn({ method: 'GET' })
  .inputValidator((input: { invitationId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(workspaceInvitationQueryDocument, { id: ctx.data.invitationId })
    return result.workspaceInvitation ?? null
  })

const acceptWorkspaceInvitation = createServerFn({ method: 'POST' })
  .inputValidator((input: { invitationId: string }) => input)
  .handler(async (ctx) => {
    const result = await backendRequest(acceptWorkspaceInvitationMutationDocument, {
      invitationId: ctx.data.invitationId,
    })
    return result.acceptWorkspaceInvitation
  })

const getWorkspaceInvitationQueryOptions = (invitationId: string) => ({
  queryKey: ['workspaceInvitation', invitationId],
  queryFn: () => getWorkspaceInvitation({ data: { invitationId } }),
})

export const Route = createFileRoute('/_authenticated/accept-invitation/$invitationId')({
  component: AcceptInvitationPage,
  loader: async ({ context, params }) => {
    await context.queryClient.ensureQueryData(getWorkspaceInvitationQueryOptions(params.invitationId))
  },
})

function AcceptInvitationPage() {
  const { invitationId } = Route.useParams()
  const { user } = Route.useRouteContext()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setWorkspace } = useWorkspace(user)

  const { data: invitation } = useSuspenseQuery(getWorkspaceInvitationQueryOptions(invitationId))

  const acceptMutation = useMutation({
    mutationFn: async () => {
      return await acceptWorkspaceInvitation({ data: { invitationId } })
    },
    onSuccess: async (data) => {
      // Switch to the newly joined workspace
      await setWorkspace(data.workspace.id)
      toastSuccess(t('workspace.invitationAccepted', { workspaceName: data.workspace.name }))
      navigate({ to: '/' })
    },
    onError: (error) => {
      if (error.message.includes('already been accepted')) {
        toastError(t('workspace.invitationAlreadyAccepted'))
      } else if (error.message.includes('expired')) {
        toastError(t('workspace.invitationExpired'))
      } else if (error.message.includes('different email')) {
        toastError(t('workspace.invitationEmailMismatch'))
      } else if (error.message.includes('already a member')) {
        toastError(t('workspace.alreadyMember'))
        navigate({ to: '/' })
      } else {
        toastError(error.message)
      }
    },
  })

  // Invitation not found
  if (!invitation) {
    return (
      <div className="bg-base-200 flex flex-col items-center justify-center space-y-4 rounded-lg p-8">
        <h2 className="text-xl font-semibold">{t('workspace.invitationNotFound')}</h2>
        <p className="text-base-content/70">{t('workspace.invitationNotFoundDescription')}</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate({ to: '/' })}>
          {t('actions.goHome')}
        </button>
      </div>
    )
  }

  const isExpired = new Date(invitation.expiresAt) < new Date()
  const isAlreadyAccepted = !!invitation.acceptedAt
  const isEmailMismatch = invitation.email.toLowerCase() !== user.email.toLowerCase()

  // Invitation expired
  if (isExpired) {
    return (
      <div className="bg-base-200 flex flex-col items-center justify-center space-y-4 rounded-lg p-8">
        <h2 className="text-xl font-semibold">{t('workspace.invitationExpiredTitle')}</h2>
        <p className="text-base-content/70">{t('workspace.invitationExpiredDescription')}</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate({ to: '/' })}>
          {t('actions.goHome')}
        </button>
      </div>
    )
  }

  // Invitation already accepted by someone
  if (isAlreadyAccepted) {
    return (
      <div className="bg-base-200 flex flex-col items-center justify-center space-y-4 rounded-lg p-8">
        <h2 className="text-xl font-semibold">{t('workspace.invitationAlreadyTakenTitle')}</h2>
        <p className="text-base-content/70">{t('workspace.invitationAlreadyTakenDescription')}</p>
        <button type="button" className="btn btn-primary" onClick={() => navigate({ to: '/' })}>
          {t('actions.goHome')}
        </button>
      </div>
    )
  }

  // Invitation is for a different email
  if (isEmailMismatch) {
    return (
      <div className="bg-base-200 flex flex-col items-center justify-center space-y-4 rounded-lg p-8">
        <h2 className="text-xl font-semibold">{t('workspace.invitationEmailMismatchTitle')}</h2>
        <p className="text-base-content/70">
          {t('workspace.invitationEmailMismatchDescription', { email: invitation.email })}
        </p>
        <button type="button" className="btn btn-primary" onClick={() => navigate({ to: '/' })}>
          {t('actions.goHome')}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-base-200 flex flex-col items-center justify-center space-y-6 rounded-lg p-8">
      <h2 className="text-xl font-semibold">{t('workspace.invitationTitle')}</h2>
      <div className="text-center">
        <p className="text-base-content/70">
          {t('workspace.invitationDescription', {
            inviterName: invitation.inviter.name || invitation.inviter.email,
            workspaceName: invitation.workspace.name,
          })}
        </p>
      </div>
      <div className="flex gap-4">
        <button type="button" className="btn btn-ghost" onClick={() => navigate({ to: '/' })}>
          {t('actions.decline')}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => acceptMutation.mutate()}
          disabled={acceptMutation.isPending}
        >
          {acceptMutation.isPending ? t('actions.accepting') : t('actions.accept')}
        </button>
      </div>
    </div>
  )
}
