import { prisma } from '@george-ai/app-database'

import { builder } from '../../builder'

const responseType = builder
  .objectRef<{
    skip?: number | null | undefined
    take?: number | null | undefined
    sortOrder?: 'asc' | 'desc' | null | undefined
    sortField?: 'name' | 'createdAt' | 'updatedAt' | null | undefined
    totalCount: number
  }>('WorkspacesResponseType')
  .implement({
    description: 'Response type for workspaces query',
    fields: (t) => ({
      items: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['Workspace'],
        nullable: false,
        resolve: async (query, { skip, take, sortOrder, sortField }, _args, { session }) => {
          const workspaces = await prisma.workspace.findMany({
            ...query,
            where: {
              members: {
                some: {
                  userId: session.user.id,
                },
              },
            },
            skip: skip ?? 0,
            take: take ?? 10,
            orderBy: sortField
              ? {
                  [sortField as string]: sortOrder,
                }
              : { createdAt: 'desc' },
          })
          return workspaces
        },
      }),
      totalCount: t.exposeInt('totalCount', {
        nullable: false,
        description: 'Total number of workspaces to support pagination',
      }),
    }),
  })

builder.queryField('workspaces', (t) =>
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
        type: builder.enumType('WorkspaceSortField', {
          values: ['name', 'createdAt', 'updatedAt'],
        }),
      }),
    },
    resolve: async (_root, { skip, take, sortOrder, sortField }, { session }) => {
      const totalCount = await prisma.workspace.count({
        where: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      })

      return { skip, take, sortOrder, sortField, totalCount }
    },
  }),
)
