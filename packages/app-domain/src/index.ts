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
