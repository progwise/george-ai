import { prisma } from '../../prisma'
import { builder } from '../builder'

// Query to get all automations for the current workspace
builder.queryField('automations', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiAutomation'],
    nullable: { list: false, items: false },
    args: {
      listId: t.arg.string({ required: false }),
    },
    resolve: (query, _source, { listId }, context) => {
      return prisma.aiAutomation.findMany({
        ...query,
        where: {
          workspaceId: context.workspaceId,
          ...(listId ? { listId } : {}),
        },
        orderBy: [{ name: 'asc' }],
      })
    },
  }),
)

// Query to get a specific automation by ID
builder.queryField('automation', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomation',
    nullable: true,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (query, _source, { id }, context) => {
      return prisma.aiAutomation.findFirst({
        ...query,
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })
    },
  }),
)

// Query to get automation items with pagination and filtering
builder.queryField('automationItems', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiAutomationItem'],
    nullable: { list: false, items: false },
    args: {
      automationId: t.arg.id({ required: true }),
      inScope: t.arg.boolean({ required: false }),
      status: t.arg.string({ required: false }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
    },
    resolve: async (query, _source, { automationId, inScope, status, skip, take }, context) => {
      // Verify automation belongs to workspace
      const automation = await prisma.aiAutomation.findFirst({
        where: {
          id: String(automationId),
          workspaceId: context.workspaceId,
        },
      })

      if (!automation) {
        return []
      }

      return prisma.aiAutomationItem.findMany({
        ...query,
        where: {
          automationId: String(automationId),
          ...(inScope !== undefined && inScope !== null ? { inScope } : {}),
          ...(status ? { status: status as 'PENDING' | 'SUCCESS' | 'WARNING' | 'FAILED' | 'SKIPPED' } : {}),
        },
        orderBy: [{ createdAt: 'desc' }],
        skip: skip ?? undefined,
        take: take ?? 50,
      })
    },
  }),
)

// Query to get automation batches (execution history)
builder.queryField('automationBatches', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiAutomationBatch'],
    nullable: { list: false, items: false },
    args: {
      automationId: t.arg.id({ required: true }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
    },
    resolve: async (query, _source, { automationId, skip, take }, context) => {
      // Verify automation belongs to workspace
      const automation = await prisma.aiAutomation.findFirst({
        where: {
          id: String(automationId),
          workspaceId: context.workspaceId,
        },
      })

      if (!automation) {
        return []
      }

      return prisma.aiAutomationBatch.findMany({
        ...query,
        where: { automationId: String(automationId) },
        orderBy: [{ createdAt: 'desc' }],
        skip: skip ?? undefined,
        take: take ?? 20,
      })
    },
  }),
)
