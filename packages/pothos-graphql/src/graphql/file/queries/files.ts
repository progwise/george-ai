import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

const responseType = builder
  .objectRef<{
    input: {
      skip?: number | null
      take?: number | null
      showArchived?: boolean | null
      libraryId?: string | null
      sortOrder?: 'asc' | 'desc' | null
      sortField?: 'createdAt' | 'name' | null
    }
    totalCount: number
    archivedCount: number
  }>('FilesQueryResponse')
  .implement({
    description: 'Response type for files query',
    fields: (t) => ({
      items: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['AiLibraryFile'],
        nullable: false,
        resolve: async (query, { input }, _args, { workspaceId, session }) => {
          await canReadWorkspaceOrThrow(workspaceId, session.user.id)
          return prisma.aiLibraryFile.findMany({
            ...query,
            where: {
              ...(input.libraryId ? { libraryId: input.libraryId } : {}),
              ...(input.showArchived ? {} : { archivedAt: null }),
            },
            orderBy:
              input.sortOrder === 'asc'
                ? { [input.sortField as string]: 'asc' }
                : { [input.sortField as string]: 'desc' },
          })
        },
      }),
      totalCount: t.exposeInt('totalCount', {
        nullable: false,
        description: 'Total number of files to support pagination',
      }),
      archivedCount: t.exposeInt('archivedCount', {
        nullable: false,
        description: 'Total number of archived files to support pagination',
      }),
    }),
  })
builder.queryField('files', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: responseType,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: false }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
      showArchived: t.arg.boolean({ required: false, defaultValue: false }),
      sortOrder: t.arg({
        type: 'SortOrder',
        required: false,
        defaultValue: 'desc',
      }),
      sortField: t.arg({
        type: builder.enumType('LibraryFilesSortField', {
          values: ['createdAt', 'name'],
        }),
        required: false,
        defaultValue: 'createdAt',
      }),
    },
    resolve: async (_root, args, { session, workspaceId }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const totalCount = await prisma.aiLibraryFile.count({
        where: {
          ...(args.libraryId ? { libraryId: args.libraryId } : {}),
          ...(args.showArchived ? {} : { archivedAt: null }),
        },
      })
      const archivedCount = await prisma.aiLibraryFile.count({
        where: {
          ...(args.libraryId ? { libraryId: args.libraryId } : {}),
          archivedAt: {
            not: null,
          },
        },
      })
      return {
        input: args,
        totalCount,
        archivedCount,
      }
    },
  }),
)
