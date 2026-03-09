import { createLogger } from '@george-ai/app-commons'

export const REGISTRY_ENTRY_TYPES = ['workspace', 'inference-host'] as const
export type RegistryEntryType = (typeof REGISTRY_ENTRY_TYPES)[number]

export const logger = createLogger('event-service-client:registry')
export const REGISTRY_BUCKET_NAME = 'george-registry'

export const getRegistryKey = (args: { type: RegistryEntryType; workspaceId: string; hostId?: string }) => {
  if (args.type === 'workspace') {
    return `workspace.${args.workspaceId}.config`
  } else if (args.type === 'inference-host') {
    return `workspace.${args.workspaceId}.inference-host.${args.hostId}.config`
  } else {
    throw new Error(`Unsupported registry entry type: ${args.type}`)
  }
}

export function getRegistryFilter(args: { type: RegistryEntryType; workspaceId?: string; hostId?: string }): string
export function getRegistryFilter(args: {
  type?: RegistryEntryType | RegistryEntryType[]
  workspaceId?: string
  hostId?: string
}): string | string[] {
  if (!args.type) {
    return REGISTRY_ENTRY_TYPES.map((t) => getRegistryFilter({ ...args, type: t }))
  }
  if (Array.isArray(args.type)) {
    return args.type.map((t) => getRegistryFilter({ ...args, type: t }))
  }
  if (args.type === 'workspace') {
    return `workspace.${args.workspaceId ? args.workspaceId : '*'}.config`
  } else if (args.type === 'inference-host') {
    return `workspace.${args.workspaceId ? args.workspaceId : '*'}.inference-host.${args.hostId ? args.hostId : '*'}.config`
  } else throw new Error(`Unsupported registry entry type: ${args.type}`)
}

export const parseRegistryKey = (
  key: string,
):
  | { type: 'workspace'; workspaceId: string; hostId?: string }
  | { type: 'inference-host'; workspaceId: string; hostId: string } => {
  const parts = key.split('.')
  const errorMessage = 'Error parsing registry key'

  if (parts.length < 3) {
    const cause = 'too short'
    logger.error(errorMessage, { key, cause })
    throw new Error(`${errorMessage}: ${cause}: ${key}`)
  }

  if (parts[0] !== 'workspace') {
    const cause = 'missing prefix'
    logger.error(errorMessage, { key, cause })
    throw new Error(`${errorMessage}: ${cause}: ${key}`)
  }

  if (parts[1].length < 3) {
    const cause = 'workspaceId too short'
    logger.error(errorMessage, { key, cause })
    throw new Error(`${errorMessage}: ${cause}: ${key}`)
  }

  if (parts[2] === 'config') {
    return { type: 'workspace', workspaceId: parts[1] }
  }

  if (parts[2] === 'inference-host' && parts.length < 5) {
    const cause = 'key too short for inference-host'
    logger.error(errorMessage, { key, cause })
    throw new Error(`${errorMessage}: ${cause}: ${key}`)
  }

  return { type: 'inference-host', workspaceId: parts[1], hostId: parts[3] }
}
