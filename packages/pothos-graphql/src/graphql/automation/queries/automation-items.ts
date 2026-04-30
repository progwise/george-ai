import { AutomationItemStatus } from '@george-ai/app-database'
import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

// Query to get automation items with pagination and filtering
builder.queryField('automationItems', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: builder
      .objectRef<{
        automationId: string
        totalCount: number
        take: number
        skip: number
        inScope: boolean
        status: AutomationItemStatus | null
      }>('AutomationItemsResult')
      .implement({
        description: 'Query result for Automation Items',
        fields: (t) => ({
          totalCount: t.exposeInt('totalCount', { nullable: false }),
          skip: t.exposeInt('skip', { nullable: false }),
          take: t.exposeInt('take', { nullable: false }),
          items: t.prismaField({
            type: ['AiAutomationItem'],
            nullable: { list: false, items: false },
            resolve: (query, root) => {
              return prisma.aiAutomationItem.findMany({
                ...query,
                where: {
                  automationId: root.automationId,
                  inScope: root.inScope,
                  ...(root.status ? { status: root.status } : {}),
                },
                orderBy: [{ listItem: { itemName: 'asc' } }, { createdAt: 'desc' }],
                skip: root.skip,
                take: root.take,
              })
            },
          }),
        }),
      }),
    nullable: false,
    args: {
      automationId: t.arg.id({ required: true }),
      inScope: t.arg.boolean({ required: false }),
      status: t.arg.string({ required: false }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
    },
    resolve: async (_parent, { automationId, inScope, status, skip, take }, { workspaceId, session }) => {
      // Verify automation belongs to workspace
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      const automation = await prisma.aiAutomation.findFirstOrThrow({
        where: {
          id: String(automationId),
          workspaceId,
        },
        include: {
          _count: {
            select: {
              items: {
                where: { inScope: inScope ?? true, ...(status ? { status: status as AutomationItemStatus } : {}) },
              },
            },
          },
        },
      })

      return {
        totalCount: automation._count.items,
        automationId: automationId,
        inScope: inScope ?? true,
        status: status as AutomationItemStatus,
        skip: skip ?? 0,
        take: take ?? 20,
      }
    },
  }),
)
