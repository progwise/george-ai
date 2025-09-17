import { EnrichmentStatus } from '.'
import { getCanAccessFileWhere, getCanAccessListWhere } from '../../domain'
import { EnrichmentStatusType } from '../../domain/enrichment'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const EnrichmentQueueResult = builder
  .objectRef<{
    userId: string
    listId?: string | null
    fileId?: string | null
    fieldId?: string | null
    take: number
    skip: number
    status?: EnrichmentStatusType | null
  }>('EnrichmentQueueResult')
  .implement({
    fields: (t) => ({
      listId: t.exposeString('listId', { nullable: true }),
      fileId: t.exposeString('fileId', { nullable: true }),
      fieldId: t.exposeString('fieldId', { nullable: true }),
      take: t.exposeInt('take'),
      skip: t.exposeInt('skip'),
      status: t.expose('status', { type: EnrichmentStatus, nullable: true }),
      enrichments: t.prismaField({
        type: ['AiEnrichmentTask'],
        nullable: { list: false, items: false },
        resolve: async (query, { userId, listId, fileId, fieldId, take, skip, status }) => {
          const listWhere = getCanAccessListWhere(userId)
          const fileWhere = getCanAccessFileWhere(userId)

          return prisma.aiEnrichmentTask.findMany({
            ...query,
            where: {
              AND: [
                listId ? { listId } : {},
                fileId ? { fileId } : {},
                fieldId ? { fieldId } : {},
                status ? { status } : {},
                { list: listWhere },
                { file: fileWhere },
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
        resolve: async ({ userId, listId, fileId, fieldId, status }) => {
          const listWhere = getCanAccessListWhere(userId)
          const fileWhere = getCanAccessFileWhere(userId)

          return prisma.aiEnrichmentTask.count({
            where: {
              AND: [
                listId ? { listId } : {},
                fileId ? { fileId } : {},
                fieldId ? { fieldId } : {},
                status ? { status } : {},
                { list: listWhere },
                { file: fileWhere },
              ],
            },
          })
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
      fileId: t.arg.string({ required: false }),
      fieldId: t.arg.string({ required: false }),
      take: t.arg.int({ required: false, defaultValue: 20 }),
      skip: t.arg.int({ required: false, defaultValue: 0 }),
      status: t.arg({ type: EnrichmentStatus, required: false }),
    },
    resolve: async (_source, { listId, fileId, fieldId, take, skip, status }, context) => {
      return {
        userId: context.session.user.id,
        listId,
        fileId,
        fieldId,
        take: take!,
        skip: skip!,
        status,
      }
    },
  }),
)
