import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { legacyFolderFiles } from '@george-ai/file-management'

import { builder } from '../../builder'
import { LegacyFile } from '../legacy-file'

const LegacyFilesResponse = builder
  .objectRef<{
    libraryId: string
    libraryName: string
    files: LegacyFile[] | null
    error?: string
  }>('LegacyFilesResponse')
  .implement({
    fields: (t) => ({
      libraryId: t.exposeString('libraryId'),
      libraryName: t.exposeString('libraryName'),
      files: t.expose('files', {
        type: ['LegacyFile'],
        nullable: { list: true, items: false },
      }),
      error: t.exposeString('error', { nullable: true }),
    }),
  })

builder.queryField('legacyFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [LegacyFilesResponse],
    nullable: false,
    args: {
      workspaceId: t.arg.string({ required: true }),
    },
    resolve: async (_root, { workspaceId }, { session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      const librariesInWorkspace = await prisma.aiLibrary.findMany({
        where: { workspaceId },
        select: { id: true, name: true, files: { select: { id: true } } },
      })

      const result: Array<{
        libraryId: string
        libraryName: string
        files: LegacyFile[] | null
      }> = []

      for (const library of librariesInWorkspace) {
        const legacyFiles = await legacyFolderFiles(library.id)

        if (!legacyFiles) {
          result.push({
            libraryId: library.id,
            libraryName: library.name,
            files: null,
          })
          continue
        }

        const files = library.files.map((file) => {
          const legacyFile = legacyFiles.find((lf) => lf.fileId === file.id)
          return {
            fileId: file.id,
            files: legacyFile ? legacyFile.files : [],
            subfolders: legacyFile ? legacyFile.subfolders : [],
            error: legacyFile && 'error' in legacyFile ? legacyFile.error : undefined,
          }
        })

        result.push({
          libraryId: library.id,
          libraryName: library.name,
          files,
        })
      }

      return result
    },
  }),
)
