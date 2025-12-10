import { GraphQLError } from 'graphql'

import { AutomationItemStatus } from '../../../prisma/generated/client'
import { canAccessAutomationOrThrow } from '../../domain/automation'
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
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: (query, _source, { id }, context) => {
      return prisma.aiAutomation.findFirstOrThrow({
        ...query,
        where: {
          id: String(id),
          workspaceId: context.workspaceId,
        },
      })
    },
  }),
)

const AutomationItemsResult = builder
  .objectRef<{
    automationId: string
    totalCount: number
    take: number
    skip: number
    inScope: boolean
    status: AutomationItemStatus | null
  }>('AiAutomationItemsResult')
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
            orderBy: [{ createdAt: 'desc' }],
            skip: root.skip,
            take: root.take,
          })
        },
      }),
    }),
  })

// Query to get automation items with pagination and filtering
builder.queryField('automationItems', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: AutomationItemsResult,
    nullable: false,
    args: {
      automationId: t.arg.id({ required: true }),
      inScope: t.arg.boolean({ required: false }),
      status: t.arg.string({ required: false }),
      skip: t.arg.int({ required: false }),
      take: t.arg.int({ required: false }),
    },
    resolve: async (_parent, { automationId, inScope, status, skip, take }, context) => {
      // Verify automation belongs to workspace
      const automation = await canAccessAutomationOrThrow(automationId, context.session.user.id, {
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

// Query to get a single automation item by ID
builder.queryField('automationItem', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAutomationItem',
    nullable: false,
    args: {
      id: t.arg.id({ required: true }),
    },
    resolve: async (query, _source, { id }, context) => {
      const item = await prisma.aiAutomationItem.findFirstOrThrow({
        ...query,
        where: { id: String(id) },
        include: {
          automation: true,
        },
      })

      // Verify automation belongs to workspace
      if (!item || item.automation.workspaceId !== context.workspaceId) {
        throw new GraphQLError('Automation item not found or access denied')
      }

      return item
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
