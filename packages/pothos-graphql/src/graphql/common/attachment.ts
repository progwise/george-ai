import { Attachment } from '@george-ai/file-management'

import { builder } from '../builder'

builder.objectRef<Attachment>('Attachment').implement({
  fields: (t) => ({
    size: t.expose('size', { type: 'Number', nullable: false }),
    fileName: t.exposeString('fileName', { nullable: false }),
    mimeType: t.exposeString('mimeType', { nullable: true }),
  }),
})
