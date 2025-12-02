import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouteContext } from '@tanstack/react-router'
import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { useTranslation } from '../../../i18n/use-translation-hook'
import { DialogForm } from '../../dialog-form'
import { toastError, toastSuccess } from '../../georgeToaster'
import { UserAvatar } from '../../user-avatar'
import { InviteMemberDialog } from './invite-member-dialog'
import { getWorkspaceInvitationsQueryOptions } from './queries/get-workspace-invitations'
import { getWorkspaceMembersQueryOptions } from './queries/get-workspace-members'
import { leaveWorkspaceFn } from './server-functions/leave-workspace'
import { removeWorkspaceMemberFn } from './server-functions/remove-member'
import { revokeWorkspaceInvitationFn } from './server-functions/revoke-invitation'
import { updateWorkspaceMemberRoleFn } from './server-functions/update-member-role'

interface WorkspaceMembersPanelProps {
  workspaceId: string
  onLeaveSuccess?: () => void
}

export const WorkspaceMembersPanel = ({ workspaceId, onLeaveSuccess }: WorkspaceMembersPanelProps) => {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const { user } = useRouteContext({ strict: false })

  const inviteDialogRef = useRef<HTMLDialogElement>(null)
  const removeDialogRef = useRef<HTMLDialogElement>(null)
  const leaveDialogRef = useRef<HTMLDialogElement>(null)
  const revokeDialogRef = useRef<HTMLDialogElement>(null)

  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null)
  const [invitationToRevoke, setInvitationToRevoke] = useState<{ id: string; email: string } | null>(null)

  const { data: members = [], isLoading: isLoadingMembers } = useQuery(getWorkspaceMembersQueryOptions(workspaceId))

  // Find current user's membership to check admin status
  const currentUserMembership = members.find((m) => m.user.id === user?.id)
  const isAdmin = currentUserMembership?.role === 'admin' || currentUserMembership?.role === 'owner'
  const isDefaultWorkspace = user?.defaultWorkspaceId === workspaceId

  // Only admins can view invitations
  const { data: invitations = [] } = useQuery({
    ...getWorkspaceInvitationsQueryOptions(workspaceId),
    enabled: isAdmin,
  })

  const removeMemberMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      return await removeWorkspaceMemberFn({ data: { workspaceId, userId } })
    },
    onSuccess: () => {
      const name = memberToRemove?.name || 'Member'
      toastSuccess(t('workspace.members.removeSuccess', { name }))
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] })
      removeDialogRef.current?.close()
      setMemberToRemove(null)
    },
    onError: (error) => {
      toastError(t('workspace.members.removeError', { message: error.message }))
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      return await updateWorkspaceMemberRoleFn({ data: { workspaceId, userId, role } })
    },
    onSuccess: (_, variables) => {
      const member = members.find((m) => m.user.id === variables.userId)
      const roleName = variables.role === 'admin' ? t('workspace.members.roleAdmin') : t('workspace.members.roleMember')
      toastSuccess(t('workspace.members.roleUpdateSuccess', { name: member?.user.name || 'Member', role: roleName }))
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] })
    },
    onError: (error) => {
      toastError(t('workspace.members.roleUpdateError', { message: error.message }))
    },
  })

  const leaveMutation = useMutation({
    mutationFn: async () => {
      return await leaveWorkspaceFn({ data: { workspaceId } })
    },
    onSuccess: () => {
      toastSuccess(t('workspace.members.leaveSuccess'))
      queryClient.invalidateQueries({ queryKey: ['workspaces'] })
      queryClient.invalidateQueries({ queryKey: ['workspaceMembers', workspaceId] })
      leaveDialogRef.current?.close()
      onLeaveSuccess?.()
    },
    onError: (error) => {
      toastError(t('workspace.members.leaveError', { message: error.message }))
    },
  })

  const revokeInvitationMutation = useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) => {
      return await revokeWorkspaceInvitationFn({ data: { invitationId } })
    },
    onSuccess: () => {
      toastSuccess(t('workspace.members.revokeSuccess'))
      queryClient.invalidateQueries({ queryKey: ['workspaceInvitations', workspaceId] })
      revokeDialogRef.current?.close()
      setInvitationToRevoke(null)
    },
    onError: (error) => {
      toastError(t('workspace.members.revokeError', { message: error.message }))
    },
  })

  const handleRemoveClick = (userId: string, name: string) => {
    setMemberToRemove({ userId, name })
    removeDialogRef.current?.showModal()
  }

  const handleRevokeClick = (id: string, email: string) => {
    setInvitationToRevoke({ id, email })
    revokeDialogRef.current?.showModal()
  }

  const formatRelativeDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'today'
    if (diffDays === 1) return 'yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  if (isLoadingMembers) {
    return (
      <div className="flex items-center justify-center p-8">
        <span className="loading loading-spinner loading-md" />
        <span className="ml-2">{t('workspace.members.loadingMembers')}</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{t('workspace.members.title')}</h3>
          <p className="text-base-content/70 text-sm">{t('workspace.members.description')}</p>
        </div>
        {isAdmin && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => inviteDialogRef.current?.showModal()}>
            {t('workspace.members.invite')}
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="divide-base-300 divide-y rounded-lg border">
        {members.length === 0 ? (
          <div className="text-base-content/70 p-4 text-center">{t('workspace.members.noMembers')}</div>
        ) : (
          members.map((member) => {
            const isCurrentUser = member.user.id === user?.id
            const isMemberAdmin = member.role === 'admin' || member.role === 'owner'

            return (
              <div
                key={member.id}
                className={twMerge('flex items-center justify-between gap-4 p-3', isCurrentUser && 'bg-base-200/50')}
              >
                <div className="flex items-center gap-3">
                  <UserAvatar user={member.user} className="size-10" />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.user.name || member.user.email}</span>
                      {isCurrentUser && (
                        <span className="text-base-content/60 text-sm">{t('workspace.members.you')}</span>
                      )}
                    </div>
                    <div className="text-base-content/60 text-sm">{member.user.email}</div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {/* Role Badge */}
                  <span
                    className={twMerge(
                      'badge badge-sm',
                      member.role === 'owner' ? 'badge-secondary' : isMemberAdmin ? 'badge-primary' : 'badge-ghost',
                    )}
                  >
                    {member.role === 'owner'
                      ? t('workspace.members.roleOwner')
                      : isMemberAdmin
                        ? t('workspace.members.roleAdmin')
                        : t('workspace.members.roleMember')}
                  </span>

                  {/* Actions */}
                  {isCurrentUser
                    ? /* Current user can leave (except owners and default workspace) */
                      member.role !== 'owner' &&
                      !isDefaultWorkspace && (
                        <button
                          type="button"
                          className="btn btn-ghost btn-xs"
                          onClick={() => leaveDialogRef.current?.showModal()}
                        >
                          {t('workspace.members.leave')}
                        </button>
                      )
                    : /* Admins can manage other members */
                      isAdmin && (
                        <div className="flex gap-1">
                          {/* Toggle role button - only show for non-owners (owners can't be demoted) */}
                          {member.role !== 'owner' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() =>
                                updateRoleMutation.mutate({
                                  userId: member.user.id,
                                  role: isMemberAdmin ? 'member' : 'admin',
                                })
                              }
                              disabled={updateRoleMutation.isPending}
                            >
                              {isMemberAdmin ? t('workspace.members.makeMember') : t('workspace.members.makeAdmin')}
                            </button>
                          )}

                          {/* Remove button - owners can't be removed */}
                          {member.role !== 'owner' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs text-error"
                              onClick={() => handleRemoveClick(member.user.id, member.user.name || member.user.email)}
                            >
                              {t('workspace.members.remove')}
                            </button>
                          )}
                        </div>
                      )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Pending Invitations (Admin only) */}
      {isAdmin && (
        <div className="mt-4">
          <h4 className="mb-2 font-medium">{t('workspace.members.pendingInvitations')}</h4>
          <div className="divide-base-300 divide-y rounded-lg border">
            {invitations.length === 0 ? (
              <div className="text-base-content/70 p-4 text-center text-sm">
                {t('workspace.members.noPendingInvitations')}
              </div>
            ) : (
              invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between gap-4 p-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-base-300 flex size-10 items-center justify-center rounded-full">
                      <span className="text-lg">✉️</span>
                    </div>
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-base-content/60 text-sm">
                        {t('workspace.members.invitedAt', { date: formatRelativeDate(invitation.createdAt) })}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    className="btn btn-ghost btn-xs text-error"
                    onClick={() => handleRevokeClick(invitation.id, invitation.email)}
                  >
                    {t('workspace.members.revoke')}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Non-admin notice */}
      {!isAdmin && <div className="text-base-content/60 text-center text-sm">{t('workspace.members.adminOnly')}</div>}

      {/* Invite Dialog */}
      <InviteMemberDialog
        ref={inviteDialogRef}
        workspaceId={workspaceId}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['workspaceInvitations', workspaceId] })
        }}
      />

      {/* Remove Member Confirmation Dialog */}
      <DialogForm
        ref={removeDialogRef}
        title={t('workspace.members.removeTitle')}
        description={t('workspace.members.removeConfirmation', { name: memberToRemove?.name || '' })}
        onSubmit={() => memberToRemove && removeMemberMutation.mutate({ userId: memberToRemove.userId })}
        submitButtonText={t('workspace.members.remove')}
        disabledSubmit={removeMemberMutation.isPending}
      />

      {/* Leave Workspace Confirmation Dialog */}
      <DialogForm
        ref={leaveDialogRef}
        title={t('workspace.members.leaveTitle')}
        description={t('workspace.members.leaveConfirmation')}
        onSubmit={() => leaveMutation.mutate()}
        submitButtonText={t('workspace.members.leave')}
        disabledSubmit={leaveMutation.isPending}
      />

      {/* Revoke Invitation Confirmation Dialog */}
      <DialogForm
        ref={revokeDialogRef}
        title={t('workspace.members.revokeTitle')}
        description={t('workspace.members.revokeConfirmation', { email: invitationToRevoke?.email || '' })}
        onSubmit={() => invitationToRevoke && revokeInvitationMutation.mutate({ invitationId: invitationToRevoke.id })}
        submitButtonText={t('workspace.members.revoke')}
        disabledSubmit={revokeInvitationMutation.isPending}
      />
    </div>
  )
}
