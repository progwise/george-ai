import { useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'

import { UserFragment } from '../../../gql/graphql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { ClientDate } from '../../client-date'
import { DialogForm } from '../../dialog-form'
import { UserAvatar } from '../../user-avatar'
import { useWorkspace } from '../use-workspace'
import { InviteMemberDialog } from './invite-member-dialog'

interface WorkspaceMembersPanelProps {
  user: UserFragment
  onLeaveSuccess?: () => void
}

export const WorkspaceMembersPanel = ({ user, onLeaveSuccess }: WorkspaceMembersPanelProps) => {
  const { t } = useTranslation()

  const inviteDialogRef = useRef<HTMLDialogElement>(null)
  const removeDialogRef = useRef<HTMLDialogElement>(null)
  const leaveDialogRef = useRef<HTMLDialogElement>(null)
  const revokeDialogRef = useRef<HTMLDialogElement>(null)

  const [memberToRemove, setMemberToRemove] = useState<{ userId: string; name: string } | null>(null)
  const [invitationToRevoke, setInvitationToRevoke] = useState<{ id: string; email: string } | null>(null)

  const {
    members,
    updateRole,
    invitations,
    leaveWorkspace,
    removeMember,
    revokeInvitation,
    isDefaultWorkspace,
    currentUserCanManage,
    currentUserRole,
    isLoading,
    isPending,
  } = useWorkspace(user)

  const currentUserIsOwner = currentUserRole === 'owner'

  const handleRemoveClick = (userId: string, name: string) => {
    setMemberToRemove({ userId, name })
    removeDialogRef.current?.showModal()
  }

  const handleRevokeClick = (id: string, email: string) => {
    setInvitationToRevoke({ id, email })
    revokeDialogRef.current?.showModal()
  }

  if (isLoading) {
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
        {currentUserCanManage && (
          <button type="button" className="btn btn-primary btn-sm" onClick={() => inviteDialogRef.current?.showModal()}>
            {t('workspace.members.invite')}
          </button>
        )}
      </div>

      {/* Members List */}
      <div className="divide-base-300 divide-y rounded-lg border">
        {members && members?.length === 0 ? (
          <div className="text-base-content/70 p-4 text-center">{t('workspace.members.noMembers')}</div>
        ) : (
          members?.map((member) => {
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
                      currentUserCanManage && (
                        <div className="flex gap-1">
                          {/* Toggle role button for non-owners */}
                          {member.role !== 'owner' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() =>
                                updateRole({
                                  userId: member.user.id,
                                  role: isMemberAdmin ? 'member' : 'admin',
                                })
                              }
                              disabled={isPending}
                            >
                              {isMemberAdmin ? t('workspace.members.makeMember') : t('workspace.members.makeAdmin')}
                            </button>
                          )}

                          {/* Demote owner button - only owners can demote other owners */}
                          {currentUserIsOwner && member.role === 'owner' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() =>
                                updateRole({
                                  userId: member.user.id,
                                  role: 'admin',
                                })
                              }
                              disabled={isPending}
                            >
                              {t('workspace.members.makeAdmin')}
                            </button>
                          )}

                          {/* Make Owner button - only owners can promote to owner */}
                          {currentUserIsOwner && member.role !== 'owner' && (
                            <button
                              type="button"
                              className="btn btn-ghost btn-xs"
                              onClick={() =>
                                updateRole({
                                  userId: member.user.id,
                                  role: 'owner',
                                })
                              }
                              disabled={isPending}
                            >
                              {t('workspace.members.makeOwner')}
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
      {currentUserCanManage && (
        <div className="mt-4">
          <h4 className="mb-2 font-medium">{t('workspace.members.pendingInvitations')}</h4>
          <div className="divide-base-300 divide-y rounded-lg border">
            {invitations && invitations.length === 0 ? (
              <div className="text-base-content/70 p-4 text-center text-sm">
                {t('workspace.members.noPendingInvitations')}
              </div>
            ) : (
              invitations?.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between gap-4 p-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-base-300 flex size-10 items-center justify-center rounded-full">
                      <span className="text-lg">✉️</span>
                    </div>
                    <div>
                      <div className="font-medium">{invitation.email}</div>
                      <div className="text-base-content/60 text-sm">
                        {t('workspace.members.invitedAt', { date: '' })}
                        <ClientDate date={invitation.createdAt} format="date" />
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
      {!currentUserCanManage && (
        <div className="text-base-content/60 text-center text-sm">{t('workspace.members.adminOnly')}</div>
      )}

      {/* Invite Dialog */}
      <InviteMemberDialog ref={inviteDialogRef} user={user} />

      {/* Remove Member Confirmation Dialog */}
      <DialogForm
        ref={removeDialogRef}
        title={t('workspace.members.removeTitle')}
        description={t('workspace.members.removeConfirmation', { name: memberToRemove?.name || '' })}
        onSubmit={() =>
          memberToRemove &&
          removeMember(
            { userId: memberToRemove.userId },
            {
              onSuccess: () => removeDialogRef.current?.close(),
            },
          )
        }
        submitButtonText={t('workspace.members.remove')}
        disabledSubmit={isPending}
      />

      {/* Leave Workspace Confirmation Dialog */}
      <DialogForm
        ref={leaveDialogRef}
        title={t('workspace.members.leaveTitle')}
        description={t('workspace.members.leaveConfirmation')}
        onSubmit={() =>
          leaveWorkspace(undefined, {
            onSuccess: () => {
              leaveDialogRef.current?.close()
              onLeaveSuccess?.()
            },
          })
        }
        submitButtonText={t('workspace.members.leave')}
        disabledSubmit={isPending}
      />

      {/* Revoke Invitation Confirmation Dialog */}
      <DialogForm
        ref={revokeDialogRef}
        title={t('workspace.members.revokeTitle')}
        description={t('workspace.members.revokeConfirmation', { email: invitationToRevoke?.email || '' })}
        onSubmit={() =>
          invitationToRevoke &&
          revokeInvitation(
            { invitationId: invitationToRevoke.id },
            {
              onSuccess: () => revokeDialogRef.current?.close(),
            },
          )
        }
        submitButtonText={t('workspace.members.revoke')}
        disabledSubmit={isPending}
      />
    </div>
  )
}
