import { StorageUsage } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<StorageUsage>('StorageUsage').implement({
  description: 'Storage usage information for a workspace',
  fields: (t) => ({
    sourceBytes: t.exposeInt('sourceBytes', { nullable: false }),
    extractedBytes: t.exposeInt('extractedBytes', { nullable: false }),
    activeExtractedBytes: t.exposeInt('activeExtractedBytes', { nullable: false }),
    physicalBytes: t.exposeInt('physicalBytes', { nullable: false }),
    sourceFiles: t.exposeInt('sourceFiles', { nullable: false }),
    extractions: t.exposeInt('extractions', { nullable: false }),
    activeExtractions: t.exposeInt('activeExtractions', { nullable: false }),
    physicalFiles: t.exposeInt('physicalFiles', { nullable: false }),
    lastReconcile: t.expose('lastReconcile', { type: 'DateTime', nullable: true }),
  }),
})
