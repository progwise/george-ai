import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useCallback, useMemo } from 'react'

import { UserFragment } from '../../gql/graphql'
import { useLocalstorage } from '../../hooks/use-local-storage'
import { useTranslation } from '../../i18n/use-translation-hook'
import { queryKeys } from '../../query-keys'
import { toastError, toastSuccess } from '../georgeToaster'
import { getWorkspaceInvitationsQueryOptions } from './members/queries/get-workspace-invitations'
import { getWorkspaceMembersQueryOptions } from './members/queries/get-workspace-members'
import { inviteWorkspaceMemberFn } from './members/server-functions/invite-member'
import { leaveWorkspaceFn } from './members/server-functions/leave-workspace'
import { removeWorkspaceMemberFn } from './members/server-functions/remove-member'
import { revokeWorkspaceInvitationFn } from './members/server-functions/revoke-invitation'
import { updateWorkspaceMemberRoleFn } from './members/server-functions/update-member-role'
import { getWorkspacesQueryOptions } from './queries/get-workspaces'
import { createWorkspaceFn } from './server-functions/create-workspace'
import { deleteWorkspaceFn } from './server-functions/delete-workspace'
import { workspaceDeleteValidationQueryOptions } from './server-functions/validate-workspace-deletion'
import { setWorkspaceCookie } from './server-functions/workspace-cookie'

const WORKSPACE_KEY = 'selectedWorkspaceId'

export const useWorkspace = (user: UserFragment) => {
  const navigate = useNavigate()

  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useQuery(getWorkspacesQueryOptions())
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useLocalstorage<string>(WORKSPACE_KEY)

  // Get current workspace from selection or fallback to user's default workspace
  const currentWorkspace = useMemo(() => {
    if (!workspaces) return null

    if (selectedWorkspaceId) {
      const workspace = workspaces.find((w: { id: string }) => w.id === selectedWorkspaceId)
      if (workspace) return workspace
    }
    // Fallback to user's default workspace (not first alphabetically)
    const defaultWorkspaceId = user?.defaultWorkspaceId
    if (defaultWorkspaceId) {
      const defaultWorkspace = workspaces.find((w: { id: string }) => w.id === defaultWorkspaceId)
      if (defaultWorkspace) return defaultWorkspace
    }
    // Final fallback to first workspace (if user has no default set)
    return workspaces[0] ?? null
  }, [workspaces, selectedWorkspaceId, user?.defaultWorkspaceId])

  // Set workspace and update cookie
  const setWorkspace = useCallback(
    async (workspaceId: string) => {
      if (workspaceId === currentWorkspace?.id) return

      await queryClient.cancelQueries()
      // Set new workspace context
      await setWorkspaceCookie({ data: { workspaceId } })
      setSelectedWorkspaceId(workspaceId)

      // Invalidate list queries - triggers refetch with new workspace context
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [queryKeys.UserDashboard] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.AiLists] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.AiLibraries] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.Automations] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.AiAssistants] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.Conversations] }),
        queryClient.invalidateQueries({ queryKey: [queryKeys.AiLanguageModels] }),
        queryClient.removeQueries({ queryKey: [queryKeys.WorkspaceMembers] }),
        queryClient.removeQueries({ queryKey: [queryKeys.WorkspaceInvitations] }),
        queryClient.removeQueries({ queryKey: [queryKeys.WorkspaceDeletionValidation] }),
      ])

      // Navigate to list view if currently on a detail page
      const currentPath = window.location.pathname
      if (currentPath.startsWith('/libraries/')) {
        await navigate({ to: '/libraries' })
      } else if (currentPath.startsWith('/assistants/')) {
        await navigate({ to: '/assistants' })
      } else if (currentPath.startsWith('/lists/')) {
        await navigate({ to: '/lists' })
      } else if (currentPath.startsWith('/conversations/')) {
        await navigate({ to: '/conversations' })
      } else if (currentPath.startsWith('/automations')) {
        await navigate({ to: '/automations' })
      }
    },
    [currentWorkspace?.id, setSelectedWorkspaceId, queryClient, navigate],
  )

  const { data: members, isLoading: isLoadingMembers } = useQuery(getWorkspaceMembersQueryOptions(currentWorkspace?.id))

  const { data: validation, isLoading: isLoadingValidation } = useQuery(
    workspaceDeleteValidationQueryOptions(currentWorkspace?.id),
  )

  const currentUserRole = useMemo(() => {
    const membership = members?.find((m) => m.user.id === user.id)
    return !membership?.role
      ? null
      : membership.role === 'admin'
        ? ('admin' as const)
        : membership.role === 'member'
          ? ('member' as const)
          : membership.role === 'owner'
            ? ('owner' as const)
            : ('unknown' as const)
  }, [members, user.id])

  const currentUserMembership = useMemo(() => {
    return members?.find((m) => m.user.id === user.id) || null
  }, [members, user.id])

  const currentUserCanManage = useMemo(() => {
    return currentUserRole === 'admin' || currentUserRole === 'owner'
  }, [currentUserRole])

  const isDefaultWorkspace = useMemo(() => {
    return user.defaultWorkspaceId === currentWorkspace?.id
  }, [user.defaultWorkspaceId, currentWorkspace?.id])

  const { data: invitations, isLoading: isLoadingInvitations } = useQuery({
    ...getWorkspaceInvitationsQueryOptions(currentWorkspace?.id),
    enabled: !!currentWorkspace?.id && currentUserCanManage,
  })

  const removeMemberMutation = useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      if (!currentWorkspace) throw new Error('No current workspace selected')
      return await removeWorkspaceMemberFn({ data: { workspaceId: currentWorkspace.id, userId } })
    },
    onSuccess: (result) => {
      const name = result.user.name || result.user.email
      toastSuccess(t('workspace.members.removeSuccess', { name }))
      queryClient.invalidateQueries({ queryKey: [queryKeys.WorkspaceMembers] })
    },
    onError: (error) => {
      toastError(t('workspace.members.removeError', { message: error.message }))
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      if (!currentWorkspace) throw new Error('No current workspace selected')

      return await updateWorkspaceMemberRoleFn({ data: { workspaceId: currentWorkspace.id, userId, role } })
    },
    onSuccess: (result) => {
      toastSuccess(t('workspace.members.roleUpdateSuccess', { name: result.user.name || 'Member', role: result.role }))
      queryClient.invalidateQueries({ queryKey: [queryKeys.WorkspaceMembers] })
    },
    onError: (error) => {
      toastError(t('workspace.members.roleUpdateError', { message: error.message }))
    },
  })

  const leaveWorkspaceMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkspace) throw new Error('No current workspace selected')
      return await leaveWorkspaceFn({ data: { workspaceId: currentWorkspace?.id } })
    },
    onSuccess: () => {
      toastSuccess(t('workspace.members.leaveSuccess'))
      setWorkspace(user.defaultWorkspaceId)

      queryClient.invalidateQueries({ queryKey: [queryKeys.Workspaces] })
      queryClient.invalidateQueries({ queryKey: [queryKeys.WorkspaceMembers] })
    },
    onError: (error) => {
      toastError(t('workspace.members.leaveError', { message: error.message }))
    },
  })

  const inviteMutation = useMutation({
    mutationFn: async (email: string) => {
      if (!currentWorkspace) throw new Error('No current workspace selected')
      return await inviteWorkspaceMemberFn({ data: { workspaceId: currentWorkspace.id, email } })
    },
    onSuccess: (_, email) => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.WorkspaceInvitations] })
      toastSuccess(t('workspace.members.inviteSuccess', { email }))
    },
    onError: (error) => {
      toastError(t('workspace.members.inviteError', { message: error.message }))
    },
  })

  const revokeInvitationMutation = useMutation({
    mutationFn: async ({ invitationId }: { invitationId: string }) => {
      return await revokeWorkspaceInvitationFn({ data: { invitationId } })
    },
    onSuccess: () => {
      toastSuccess(t('workspace.members.revokeSuccess'))
      queryClient.invalidateQueries({ queryKey: [queryKeys.WorkspaceInvitations] })
    },
    onError: (error) => {
      toastError(t('workspace.members.revokeError', { message: error.message }))
    },
  })

  const createWorkspaceMutation = useMutation({
    mutationFn: async (data: { name: string; slug: string }) => {
      return await createWorkspaceFn({ data })
    },
    onSuccess: async ({ id }) => {
      toastSuccess(t('workspace.createSuccess'))
      console.log('Switching to new workspace:', id)
      await setWorkspace(id)
    },
    onError: (error) => {
      toastError(error.message)
    },
  })

  const deleteWorkspaceMutation = useMutation({
    mutationFn: async (workspaceId: string) => {
      return await deleteWorkspaceFn({ data: { workspaceId } })
    },
    onSuccess: async () => {
      toastSuccess(t('workspace.deleteSuccess'))
      await setWorkspace(user.defaultWorkspaceId)
    },
    onError: (error) => {
      toastError(error.message)
    },
  })

  const reValidate = useCallback(() => {
    if (currentWorkspace?.id) {
      queryClient.invalidateQueries({ queryKey: [queryKeys.WorkspaceDeletionValidation, currentWorkspace.id] })
    }
  }, [currentWorkspace?.id, queryClient])

  return {
    workspaces: workspaces ?? [],
    currentWorkspace,
    currentWorkspaceId: currentWorkspace?.id || null,
    isDefaultWorkspace,
    setWorkspace,
    members,
    invitations,
    currentUserRole,
    currentUserMembership,
    currentUserCanManage,
    inviteMember: inviteMutation.mutate,
    leaveWorkspace: leaveWorkspaceMutation.mutate,
    removeMember: removeMemberMutation.mutate,
    revokeInvitation: revokeInvitationMutation.mutate,
    updateRole: updateRoleMutation.mutate,
    validation,
    reValidate,
    createWorkspace: createWorkspaceMutation.mutate,
    deleteWorkspace: deleteWorkspaceMutation.mutate,
    isLoading: isLoadingWorkspaces || isLoadingMembers || isLoadingInvitations || isLoadingValidation,
    isPending:
      leaveWorkspaceMutation.isPending ||
      removeMemberMutation.isPending ||
      revokeInvitationMutation.isPending ||
      updateRoleMutation.isPending ||
      inviteMutation.isPending ||
      deleteWorkspaceMutation.isPending,
  }
}
