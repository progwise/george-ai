import { createLogger } from '@george-ai/app-commons'

const logger = createLogger('app-domain:workspace')

export { logger }

export const getSlugFromName = (name: string): string => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 50)
}

export const isValidSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugRegex.test(slug)
}

/**
 * System workspace ID - fixed UUID for the default workspace
 * All users are assigned to this workspace on creation
 */
export const SYSTEM_WORKSPACE_ID = '00000000-0000-0000-0000-000000000001'
