// Export Prisma client singleton (what everyone uses)
export { prisma } from './prisma'

// Export Prisma namespace for types (filters, enums, etc.)
export { Prisma } from '../prisma/generated/client'

// Export all generated types for convenience
export type * from '../prisma/generated/client'

export type * from '../prisma/generated/models'

export * from '../prisma/generated/sql'

// Export Pothos types (only used by pothos-graphql)
export type { default as PothosTypes } from '../prisma/generated/pothos'
export { getDatamodel } from '../prisma/generated/pothos'

export type * from '../../app-domain/src/context'

export type * from '../../app-domain/src/workspace'
export { default as workspace } from '../../app-domain/src/workspace'

export type * from '../../app-domain/src/user'
export { default as user } from '../../app-domain/src/user'

export type * from '../../app-domain/src/api-key'
export { default as apiKey } from '../../app-domain/src/api-key'

export { default as testing } from './testing'
