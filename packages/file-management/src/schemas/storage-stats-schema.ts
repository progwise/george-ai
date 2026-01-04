import z from 'zod'

export const StorageStatsSchema = z.object({
  // 'activeBytes': Only the current source + the 'active' extraction
  // (the one the user actually sees/uses).
  activeBytes: z.number().int().nonnegative(),

  // 'physicalBytes': Everything in the folder, including stale/failed
  // extractions and logs. This is what you pay your cloud provider for.
  physicalBytes: z.number().int().nonnegative(),

  // File counting
  // "activeFileCount": Number of source files + active extraction files
  activeFileCount: z.number().int().nonnegative(),

  // "totalFileCount": Every single file in the tree (including stale extractions/shards)
  totalFileCount: z.number().int().nonnegative(),

  lastFullScan: z.string().datetime().optional(),
  lastUpdated: z.string().datetime(),
  integrityState: z.enum(['healthy', 'recalculating', 'stale', 'reconciled']).default('healthy'),
})

export type StorageStats = z.infer<typeof StorageStatsSchema>
