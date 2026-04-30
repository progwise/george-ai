import z from 'zod'

export const WORKSPACE_ROLES = ['owner', 'admin', 'member', 'viewer'] as const
export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]
export const WorkspaceRoleSchema = z.enum(WORKSPACE_ROLES)
