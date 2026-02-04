export const ROLES = ['owner', 'admin', 'member', 'viewer'] as const

export type Role = (typeof ROLES)[number]

export function getRole(role: string): Role {
  if (ROLES.includes(role as Role)) {
    return role as Role
  }
  throw new Error(`Invalid role: ${role}`)
}
