import { EnrichmentStatus } from '.'
import { getListStatistics } from '../../../prisma/generated/sql'
import { canAccessListOrThrow, getCanAccessListWhere } from '../../domain'
import { EnrichmentStatusType } from '../../domain/enrichment'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const EnrichmentQueueResult = builder
  .objectRef<{
    workspaceId: string
    listId?: string | null
    itemId?: string | null
    fieldId?: string | null
    take: number
    skip: number
    status?: EnrichmentStatusType | null
  }>('EnrichmentQueueResult')
  .implement({
    fields: (t) => ({
      listId: t.exposeString('listId', { nullable: true }),
      itemId: t.exposeString('itemId', { nullable: true }),
      fieldId: t.exposeString('fieldId', { nullable: true }),
      take: t.exposeInt('take'),
      skip: t.exposeInt('skip'),
      status: t.expose('status', { type: EnrichmentStatus, nullable: true }),
      enrichments: t.prismaField({
        type: ['AiEnrichmentTask'],
        nullable: { list: false, items: false },
        resolve: async (query, { workspaceId, listId, itemId, fieldId, take, skip, status }) => {
          const listWhere = getCanAccessListWhere(workspaceId)

          return prisma.aiEnrichmentTask.findMany({
            ...query,
            where: {
              AND: [
                listId ? { listId } : {},
                itemId ? { itemId } : {},
                fieldId ? { fieldId } : {},
                status ? { status } : {},
                { list: listWhere },
              ],
            },
            take,
            skip,
            orderBy: [{ requestedAt: 'desc' }, { id: 'asc' }],
          })
        },
      }),
      totalCount: t.int({
        nullable: false,
        resolve: async ({ workspaceId, listId, itemId, fieldId, status }) => {
          const listWhere = getCanAccessListWhere(workspaceId)

          return prisma.aiEnrichmentTask.count({
            where: {
              AND: [
                listId ? { listId } : {},
                itemId ? { itemId } : {},
                fieldId ? { fieldId } : {},
                status ? { status } : {},
                { list: listWhere },
              ],
            },
          })
        },
      }),
      statusCounts: t.field({
        type: [
          builder
            .objectRef<{
              status: EnrichmentStatusType
              count: number
            }>('EnrichmentStatusCount')
            .implement({
              fields: (t) => ({
                status: t.expose('status', { type: EnrichmentStatus, nullable: false }),
                count: t.exposeInt('count', { nullable: false }),
              }),
            }),
        ],
        nullable: false,
        resolve: async ({ workspaceId, listId, itemId, fieldId }) => {
          const listWhere = getCanAccessListWhere(workspaceId)

          const counts = await prisma.aiEnrichmentTask.groupBy({
            by: ['status'],
            where: {
              AND: [
                listId ? { listId } : {},
                itemId ? { itemId } : {},
                fieldId ? { fieldId } : {},
                { list: listWhere },
              ],
            },
            _count: {
              status: true,
            },
          })

          return counts.map((c) => ({
            status: c.status,
            count: c._count.status,
          }))
        },
      }),
    }),
  })

builder.queryField('aiListEnrichments', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: EnrichmentQueueResult,
    nullable: false,
    args: {
      listId: t.arg.string({ required: false }),
      itemId: t.arg.string({ required: false }),
      fieldId: t.arg.string({ required: false }),
      take: t.arg.int({ required: false, defaultValue: 20 }),
      skip: t.arg.int({ required: false, defaultValue: 0 }),
      status: t.arg({ type: EnrichmentStatus, required: false }),
    },
    resolve: async (_source, { listId, itemId, fieldId, take, skip, status }, context) => {
      return {
        workspaceId: context.workspaceId,
        listId,
        itemId,
        fieldId,
        take: take!,
        skip: skip!,
        status,
      }
    },
  }),
)

builder.queryField('aiListEnrichmentsStatistics', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [
      builder
        .objectRef<{
          listId: string
          fieldId: string
          fieldName: string
          itemCount: number
          cacheCount: number
          valuesCount: number
          missingCount: number
          completedTasksCount: number
          errorTasksCount: number
          failedTasksCount: number
          pendingTasksCount: number
          processingTasksCount: number
        }>('AiListFieldStatistics')
        .implement({
          fields: (t) => ({
            listId: t.exposeString('listId', { nullable: false }),
            fieldId: t.exposeString('fieldId', { nullable: false }),
            fieldName: t.exposeString('fieldName', { nullable: false }),
            itemCount: t.exposeInt('itemCount', { nullable: false }),
            cacheCount: t.exposeInt('cacheCount', { nullable: false }),
            valuesCount: t.exposeInt('valuesCount', { nullable: false }),
            missingCount: t.exposeInt('missingCount', {
              nullable: false,
              description: 'Items where value matched a failure term',
            }),
            completedTasksCount: t.exposeInt('completedTasksCount', { nullable: false }),
            errorTasksCount: t.exposeInt('errorTasksCount', { nullable: false }),
            failedTasksCount: t.exposeInt('failedTasksCount', { nullable: false }),
            pendingTasksCount: t.exposeInt('pendingTasksCount', { nullable: false }),
            processingTasksCount: t.exposeInt('processingTasksCount', { nullable: false }),
          }),
        }),
    ],
    nullable: { list: false, items: false },
    args: {
      listId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { listId }, context) => {
      await canAccessListOrThrow(listId, context.session.user.id)
      const result = await prisma.$queryRawTyped(getListStatistics(listId))
      return result.map((r) => ({
        listId: r.listId,
        fieldId: r.fieldId,
        fieldName: r.fieldName,
        itemCount: Number(r.itemCount),
        cacheCount: Number(r.cacheCount),
        valuesCount: Number(r.valuesCount),
        missingCount: Number(r.missingCount),
        completedTasksCount: Number(r.completedTasksCount),
        errorTasksCount: Number(r.errorTasksCount),
        failedTasksCount: Number(r.failedTasksCount),
        pendingTasksCount: Number(r.pendingTasksCount),
        processingTasksCount: Number(r.processingTasksCount),
      }))
    },
  }),
)
