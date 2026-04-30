import PrismPothosPlugin from '@pothos/plugin-prisma'

// Export Prisma client singleton (what everyone uses)
export { prisma } from './prisma'

// Export Prisma namespace for types (filters, enums, etc.)
export { Prisma } from '../prisma/generated/client'

// Export all generated types for convenience
export * from '../prisma/generated/client'
export * from '../prisma/generated/models'
export * from '../prisma/generated/sql'

// Export Pothos types (only used by pothos-graphql)
export type { default as PothosTypes } from '../prisma/generated/pothos'
export { getDatamodel } from '../prisma/generated/pothos'

export const PrismaPothosPlugin = PrismPothosPlugin
