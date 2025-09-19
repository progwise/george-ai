import { canAccessListOrThrow, getCanAccessListWhere } from '../../domain'
import { getEnrichmentTaskInputMetadata, getFieldEnrichmentValidationSchema } from '../../domain/enrichment'
import { prisma } from '../../prisma'
import { builder } from '../builder'

const EnrichmentQueueTasksMutationResult = builder
  .objectRef<{
    createdTasksCount: number
    cleanedUpTasksCount: number
    cleanedUpEnrichmentsCount?: number
  }>('EnrichmentQueueTasksMutationResult')
  .implement({
    fields: (t) => ({
      createdTasksCount: t.exposeInt('createdTasksCount', { nullable: true }),
      cleanedUpTasksCount: t.exposeInt('cleanedUpTasksCount', { nullable: true }),
      cleanedUpEnrichmentsCount: t.exposeInt('cleanedUpEnrichmentsCount', { nullable: true }),
    }),
  })

builder.mutationField('createEnrichmentTasks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: EnrichmentQueueTasksMutationResult,
    nullable: false,
    args: {
      listId: t.arg.string({ required: true }),
      fieldId: t.arg.string({ required: true, description: 'Field ID to enrich' }),
      fileId: t.arg.string({
        required: false,
        description: 'Optional File ID to only create task for a specific file',
      }),
      onlyMissingValues: t.arg.boolean({
        required: false,
        defaultValue: true,
        description: 'Only create tasks for files that do not yet have a cached value for this field',
      }),
    },
    resolve: async (_source, { listId, fieldId, fileId, onlyMissingValues }, { session }) => {
      console.log('🔍 Starting enrichment for listId:', listId, 'fieldId:', fieldId)
      const list = await prisma.aiList.findFirstOrThrow({
        where: {
          AND: [
            { id: listId },
            getCanAccessListWhere(session.user.id),
            onlyMissingValues
              ? {
                  fields: {
                    some: {
                      AND: [
                        { id: fieldId },
                        { sourceType: 'llm_computed' },
                        { cachedValues: { none: { OR: [{ fieldId }, { enrichmentErrorMessage: { not: null } }] } } },
                      ],
                    },
                  },
                }
              : {},
          ],
        },
        include: {
          fields: {
            where: { sourceType: 'llm_computed', id: fieldId },
            take: 1,
            include: {
              context: {
                include: {
                  contextField: {
                    select: {
                      id: true,
                      name: true,
                      fileProperty: true,
                      sourceType: true,
                      type: true,
                      cachedValues: true,
                    },
                  },
                },
              },
            },
          },
          sources: {
            include: {
              library: {
                include: {
                  files: {
                    where: fileId ? { id: fileId } : {},
                    include: {
                      crawledByCrawler: { select: { id: true, uri: true } },
                      library: { select: { id: true, name: true, embeddingModelName: true } },
                      cache: { where: { fieldId } },
                      contentExtractionTasks: {
                        where: { processingFinishedAt: { not: null } },
                        orderBy: { processingFinishedAt: 'desc' },
                        take: 1,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      })

      const {
        success: fieldValidationSuccess,
        data: validatedField,
        error: fieldValidationError,
      } = getFieldEnrichmentValidationSchema({ useVectorStore: list.fields[0].useVectorStore }).safeParse(
        list.fields[0],
      )

      if (!fieldValidationSuccess) {
        throw new Error(
          `Cannot create enrichment tasks für field ${fieldId}: Validation error: ${fieldValidationError?.message}`,
        )
      }

      const files = list.sources.flatMap((source) => source.library?.files || [])
      if (files.length === 0) {
        return {
          success: true,
          createdTasksCount: 0,
          cleanedUpTasksCount: 0,
          error: 'No files to process for this list',
        }
      }

      // First, clean up any existing queue items for this field to allow fresh start

      const transactionResult = await prisma.$transaction(async (tx) => {
        const cleanupTasksResult = await tx.aiEnrichmentTask.deleteMany({
          where: {
            listId,
            fieldId,
          },
        })

        const createTasksResult = await tx.aiEnrichmentTask.createMany({
          data: files.map((file) => {
            const metadata = getEnrichmentTaskInputMetadata({ validatedField, file })
            return {
              listId,
              fieldId,
              fileId: file.id,
              status: 'pending',
              priority: 0,
              metadata: JSON.stringify({ input: metadata }),
            }
          }),
        })

        return { createTasksResult, cleanupTasksResult }
      })

      return {
        createdTasksCount: transactionResult.createTasksResult.count,
        cleanedUpTasksCount: transactionResult.cleanupTasksResult.count,
      }
    },
  }),
)

builder.mutationField('deletePendingEnrichmentTasks', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: EnrichmentQueueTasksMutationResult,
    nullable: false,
    args: {
      listId: t.arg.string({ required: true, description: 'List ID to stop enrichment for' }),
      fieldId: t.arg.string({ required: false, description: 'Field ID to stop enrichment for' }),
      fileId: t.arg.string({ required: false, description: 'File ID to stop enrichment for' }),
    },
    resolve: async (_source, { listId, fieldId, fileId }, { session }) => {
      await canAccessListOrThrow(listId, session.user.id)

      const deletedItems = await prisma.aiEnrichmentTask.deleteMany({
        where: {
          AND: [{ status: 'pending' }, { listId }, fieldId ? { fieldId } : {}, fileId ? { fileId } : {}],
        },
      })

      return {
        cleanedUpTasksCount: deletedItems.count,
        createdTasksCount: 0,
      }
    },
  }),
)

builder.mutationField('clearListEnrichments', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: EnrichmentQueueTasksMutationResult,
    nullable: false,
    args: {
      listId: t.arg.string({
        required: true,
        description:
          'List ID to clean enrichments for. Without additional arguments it will clean all enriched values from all fields and items in the list',
      }),
      fieldId: t.arg.string({
        required: false,
        description: 'Optional Field ID to only clean enrichments for a specific field',
      }),
      fileId: t.arg.string({
        required: false,
        description: 'Optional File ID to only clean enrichments for a specific file',
      }),
    },
    resolve: async (_source, { listId, fieldId, fileId }, { session }) => {
      await canAccessListOrThrow(listId, session.user.id)

      const transactionResult = await prisma.$transaction(async (tx) => {
        const deletedCacheItems = await tx.aiListItemCache.deleteMany({
          where: {
            AND: [
              {
                field: { AND: [{ listId }, fieldId ? { id: fieldId } : {}] },
              },
              {
                fileId: fileId || undefined,
              },
            ],
          },
        })
        const deletedEnrichmentTasks = await tx.aiEnrichmentTask.deleteMany({
          where: {
            AND: [
              fileId ? { fileId } : {},
              fieldId ? { fieldId } : {},
              { listId },
              { status: { in: ['pending', 'failed', 'canceled'] } },
            ],
          },
        })
        return { deletedCacheItems, deletedEnrichmentTasks }
      })

      return {
        cleanedUpTasksCount: transactionResult.deletedEnrichmentTasks.count,
        createdTasksCount: 0,
        cleanedUpEnrichmentsCount: transactionResult.deletedCacheItems.count,
      }
    },
  }),
)
