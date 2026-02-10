import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

const responseType = builder
  .objectRef<{
    skip?: number | null | undefined
    take?: number | null | undefined
    sortOrder?: 'asc' | 'desc' | null | undefined
    sortField?: 'name' | 'createdAt' | 'updatedAt' | null | undefined
    totalCount: number
  }>('LibrariesResponseType')
  .implement({
    fields: (t) => ({
      items: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['AiLibrary'],
        nullable: false,
        resolve: async (query, { skip, take, sortOrder, sortField }, _args, { workspaceId }) => {
          const libraries = await prisma.aiLibrary.findMany({
            ...query,
            where: {
              workspaceId,
            },
            skip: skip ?? 0,
            take: take ?? 10,
            orderBy: sortField
              ? {
                  [sortField as string]: sortOrder,
                }
              : { createdAt: 'desc' },
          })
          return libraries
        },
      }),
      totalCount: t.exposeInt('totalCount', {
        nullable: false,
        description: 'Total number of libraries to support pagination',
      }),
    }),
  })

builder.queryField('libraries', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: responseType,
    nullable: false,
    args: {
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
      sortOrder: t.arg({
        required: false,
        defaultValue: 'desc',
        type: 'SortOrder',
      }),
      sortField: t.arg({
        required: false,
        defaultValue: 'name',
        type: builder.enumType('LibrarySortField', {
          values: ['name', 'createdAt', 'updatedAt'],
        }),
      }),
    },
    resolve: async (_root, { skip, take, sortOrder, sortField }, { workspaceId, session }) => {
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)
      const totalCount = await prisma.aiLibrary.count({
        where: {
          workspaceId,
        },
      })

      return { skip, take, sortOrder, sortField, totalCount }
    },
  }),
)
