import { StorageStats } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<StorageStats>('StorageStats').implement({
  description: 'Storage usage information for a workspace',
  fields: (t) => ({
    extractionBytes: t.expose('extractionBytes', { type: 'Number', nullable: false }),
    attachmentBytes: t.expose('attachmentBytes', { type: 'Number', nullable: false }),
    physicalBytes: t.expose('physicalBytes', { type: 'Number', nullable: false }),

    extractionFileCount: t.exposeInt('extractionFileCount', { nullable: false }),
    attachmentFileCount: t.exposeInt('attachmentFileCount', { nullable: false }),
    physicalFileCount: t.exposeInt('physicalFileCount', { nullable: false }),

    lastReconcile: t.expose('lastReconcile', { type: 'DateTime', nullable: true }),
    lastUpdate: t.expose('lastUpdate', { type: 'DateTime', nullable: true }),
  }),
})
