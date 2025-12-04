import { canAccessListOrThrow } from '../../domain'
import { getEnrichmentTaskInputMetadata, getFieldEnrichmentValidationSchema } from '../../domain/enrichment'
import { getListFiltersWhere } from '../../domain/list'
import { prisma } from '../../prisma'
import { AiListFilterInput } from '../ai-list/field-values'
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
      itemId: t.arg.string({
        required: false,
        description: 'Optional Item ID to only create task for a specific item',
      }),
      onlyMissingValues: t.arg.boolean({
        required: false,
        defaultValue: true,
        description: 'Only create tasks for items that do not yet have a cached value for this field',
      }),
      filters: t.arg({ type: [AiListFilterInput!], required: false }),
    },
    resolve: async (_source, { listId, fieldId, itemId, onlyMissingValues, filters }, { session }) => {
      console.log('🔍 Starting enrichment for listId:', listId, 'fieldId:', fieldId)
      const list = await canAccessListOrThrow(listId, session.user.id, {
        include: {
          fields: {
            where: { id: fieldId },
            include: {
              languageModel: { select: { id: true, provider: true, name: true } },
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
                orderBy: { createdAt: 'asc' },
              },
            },
          },
          sources: { include: { library: true } },
        },
      })

      if (list.fields.length === 0) {
        throw new Error(`Cannot create enrichment tasks: Field ${fieldId} not found in list ${listId}`)
      }

      const listField = list.fields[0]
      if (listField.sourceType !== 'llm_computed') {
        throw new Error(`Cannot create enrichment tasks for field ${fieldId}: Field is not enrichable`)
      }

      // Collect all field IDs we need cache data for (enriched field + all referenced context fields)
      const fieldWithContext = listField as typeof listField & {
        context: Array<{
          contextType: string
          contextField: { id: string } | null
        }>
      }
      const contextFieldIds = fieldWithContext.context
        .filter((ctx) => ctx.contextType === 'fieldReference' && ctx.contextField?.id)
        .map((ctx) => ctx.contextField!.id)
      const allFieldIds = [fieldId, ...contextFieldIds]

      const filterConditions = await getListFiltersWhere(filters || [])

      // Query items instead of files
      const items = await prisma.aiListItem.findMany({
        include: {
          cache: { where: { fieldId: { in: allFieldIds } } },
          sourceFile: {
            include: {
              crawledByCrawler: { select: { id: true, uri: true } },
              library: {
                select: {
                  id: true,
                  name: true,
                  embeddingModel: { select: { id: true, provider: true, name: true } },
                },
              },
              contentExtractionTasks: {
                where: { processingFinishedAt: { not: null } },
                orderBy: { processingFinishedAt: 'desc' },
                take: 1,
              },
            },
          },
        },
        where: {
          listId,
          ...filterConditions,
          ...(itemId ? { id: itemId } : {}),
          sourceFile: { archivedAt: null },
          ...(onlyMissingValues
            ? {
                OR: [
                  // Items with no cache entry for this field at all
                  {
                    cache: {
                      none: { fieldId },
                    },
                  },
                  // Items with cache entry but no valid value (all value fields are null)
                  {
                    cache: {
                      some: {
                        AND: [
                          { fieldId },
                          { valueString: null },
                          { valueBoolean: null },
                          { valueDate: null },
                          { valueNumber: null },
                        ],
                      },
                    },
                  },
                  // Items where enrichment returned a failure term (stored in failedEnrichmentValue)
                  {
                    cache: {
                      some: {
                        AND: [{ fieldId }, { failedEnrichmentValue: { not: null } }],
                      },
                    },
                  },
                ],
              }
            : {}),
        },
      })

      console.log('found items for enrichment:', items.length)

      // Transform field to match validation schema (convert languageModel relation to string)
      const fieldWithRelation = listField as typeof listField & {
        languageModel?: { id: string; provider: string; name: string } | null
      }
      const fieldForValidation = {
        ...fieldWithRelation,
        languageModelId: fieldWithRelation.languageModel?.id || '',
        languageModelName: fieldWithRelation.languageModel?.name || '',
        languageProvider: fieldWithRelation.languageModel?.provider || null,
      }

      const {
        success: fieldValidationSuccess,
        data: validatedField,
        error: fieldValidationError,
      } = getFieldEnrichmentValidationSchema().safeParse(fieldForValidation)

      if (!fieldValidationSuccess) {
        throw new Error(
          `Cannot create enrichment tasks für field ${fieldId}: Validation error: ${fieldValidationError?.message}`,
        )
      }

      if (items.length === 0) {
        return {
          success: true,
          createdTasksCount: 0,
          cleanedUpTasksCount: 0,
          error: 'No items to process for this list',
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
          data: items.map((item) => {
            const metadata = getEnrichmentTaskInputMetadata({ validatedField, item })
            return {
              listId,
              fieldId,
              itemId: item.id,
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
      itemId: t.arg.string({ required: false, description: 'Item ID to stop enrichment for' }),
    },
    resolve: async (_source, { listId, fieldId, itemId }, { session }) => {
      await canAccessListOrThrow(listId, session.user.id)

      const deletedItems = await prisma.aiEnrichmentTask.deleteMany({
        where: {
          AND: [{ status: 'pending' }, { listId }, fieldId ? { fieldId } : {}, itemId ? { itemId } : {}],
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
      itemId: t.arg.string({
        required: false,
        description: 'Optional Item ID to only clean enrichments for a specific item',
      }),
    },
    resolve: async (_source, { listId, fieldId, itemId }, { session }) => {
      await canAccessListOrThrow(listId, session.user.id)

      const transactionResult = await prisma.$transaction(async (tx) => {
        const deletedCacheItems = await tx.aiListItemCache.deleteMany({
          where: {
            AND: [
              {
                field: { AND: [{ listId }, fieldId ? { id: fieldId } : {}] },
              },
              itemId ? { itemId } : {},
            ],
          },
        })
        const deletedEnrichmentTasks = await tx.aiEnrichmentTask.deleteMany({
          where: {
            AND: [
              itemId ? { itemId } : {},
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
