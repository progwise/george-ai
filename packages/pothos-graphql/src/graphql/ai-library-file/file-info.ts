import { FileInfo } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.objectRef<FileInfo>('FileInfo').implement({
  fields: (t) => ({
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    fileId: t.exposeString('fileId', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: true }),
    uploadedAt: t.expose('uploadedAt', { type: 'DateTime', nullable: true }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    size: t.exposeInt('size', { nullable: true }),
    sourceHash: t.exposeString('sourceHash', { nullable: true }),
    originalUpdatedAt: t.expose('originalUpdatedAt', { type: 'DateTime', nullable: true }),
  }),
})
