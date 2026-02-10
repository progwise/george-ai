import { logger } from '../common'

export const WORKSPACE_ROLES = ['owner', 'admin', 'member', 'viewer'] as const

export type WorkspaceRole = (typeof WORKSPACE_ROLES)[number]

export function getWorkspaceRole(role: string): WorkspaceRole | null {
  if (WORKSPACE_ROLES.includes(role as WorkspaceRole)) {
    return role as WorkspaceRole
  }

  logger.warn(`Invalid workspace role: ${role}`)
  return null
}
