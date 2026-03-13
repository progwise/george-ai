import { builder } from '../builder'

export interface LegacyFile {
  fileId: string
  files: string[]
  subfolders: string[]
  error?: string
}

builder.objectRef<LegacyFile>('LegacyFile').implement({
  fields: (t) => ({
    fileId: t.exposeString('fileId'),
    files: t.exposeStringList('files'),
    subfolders: t.exposeStringList('subfolders'),
    error: t.exposeString('error', { nullable: true }),
  }),
})
