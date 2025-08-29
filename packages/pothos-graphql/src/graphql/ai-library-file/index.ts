import { dateTimeString } from '@george-ai/web-utils'

import { findCacheValue, getFieldValue } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

import './read-file'
import './file-chunks'
import './queries'
import './mutations'

console.log('Setting up: AiLibraryFile')

//TODO: Move to ai-list and remove it here from the file
const FieldValueResult = builder
  .objectRef<{
    fieldId: string
    fieldName: string
    displayValue: string | null
    enrichmentErrorMessage: string | null
    queueStatus: string | null
  }>('FieldValueResult')
  .implement({
    fields: (t) => ({
      fieldId: t.exposeString('fieldId', { nullable: false }),
      fieldName: t.exposeString('fieldName', { nullable: false }),
      displayValue: t.exposeString('displayValue', { nullable: true }),
      enrichmentErrorMessage: t.exposeString('enrichmentErrorMessage', { nullable: true }),
      queueStatus: t.exposeString('queueStatus', { nullable: true }),
    }),
  })

builder.prismaObject('AiLibraryFile', {
  name: 'AiLibraryFile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    name: t.exposeString('name', { nullable: false }),
    originUri: t.exposeString('originUri', { nullable: true }),
    docPath: t.exposeString('docPath', { nullable: true }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    size: t.exposeInt('size', { nullable: true }),
    uploadedAt: t.expose('uploadedAt', { type: 'DateTime', nullable: true }),
    libraryId: t.exposeString('libraryId', {
      nullable: false,
    }),
    dropError: t.exposeString('dropError', { nullable: true }),
    originModificationDate: t.expose('originModificationDate', { type: 'DateTime', nullable: true }),
    archivedAt: t.expose('archivedAt', { type: 'DateTime', nullable: true }),
    crawledByCrawler: t.relation('crawledByCrawler', { nullable: true }),
    lastUpdate: t.prismaField({
      type: 'AiLibraryUpdate',
      nullable: true,
      resolve: async (query, file) => {
        return await prisma.aiLibraryUpdate.findFirst({
          ...query,
          where: { fileId: file.id },
          orderBy: { createdAt: 'desc' },
        })
      },
    }),

    // Content extraction tasks relation
    //contentExtractionTasks: t.relation('contentExtractionTasks', { nullable: false }),

    // Computed fields for latest tasks

    cache: t.relation('cache', { nullable: false }),
    //TODO: Move it to aiList and remove it here from the file
    fieldValues: t.field({
      type: [FieldValueResult],
      nullable: { list: false, items: false },
      args: {
        fieldIds: t.arg.stringList({ required: true }),
        language: t.arg.string({ required: true }),
      },
      resolve: async (file, { fieldIds, language }) => {
        // Get all field definitions with their associated lists
        const fields = await prisma.aiListField.findMany({
          where: { id: { in: fieldIds } },
          include: {
            list: {
              include: { participants: true },
            },
          },
        })

        // Get file with required relations
        const fileWithRelations = await prisma.aiLibraryFile.findUnique({
          where: { id: file.id },
          include: {
            crawledByCrawler: true,
            cache: true,
          },
        })
        if (!fileWithRelations) {
          return fieldIds.map((fieldId) => {
            const field = fields.find((f) => f.id === fieldId)
            return {
              fieldId,
              fieldName: field?.name || 'Unknown',
              displayValue: null,
              enrichmentErrorMessage: null,
              queueStatus: null,
            }
          })
        }

        // Process all fields at once, maintaining order
        const results = []
        for (const fieldId of fieldIds) {
          const field = fields.find((f) => f.id === fieldId)
          if (!field) {
            results.push({
              fieldId,
              fieldName: 'Unknown',
              displayValue: null,
              enrichmentErrorMessage: null,
              queueStatus: null,
            })
            continue
          }

          const cache = findCacheValue(fileWithRelations, fieldId)
          const { value: computedValue, errorMessage } = await getFieldValue(fileWithRelations, field, cache)

          // Check queue status for this file-field combination
          let queueStatus: string | null = null
          if (field.sourceType === 'llm_computed' && !computedValue && !errorMessage) {
            const queueItem = await prisma.aiListEnrichmentQueue.findFirst({
              where: {
                fieldId: fieldId,
                fileId: file.id,
                status: { in: ['pending', 'processing'] },
              },
              orderBy: { requestedAt: 'desc' },
            })
            queueStatus = queueItem?.status || null
          }

          // Format display value based on field type
          let displayValue = computedValue
          if (computedValue) {
            // Handle date formatting
            if (
              field.type === 'date' ||
              field.type === 'datetime' ||
              field.fileProperty === 'processedAt' ||
              field.fileProperty === 'originModificationDate'
            ) {
              try {
                displayValue = dateTimeString(computedValue, language)
              } catch {
                displayValue = computedValue
              }
            }
            // Handle boolean formatting
            else if (field.type === 'boolean' && field.sourceType === 'llm_computed') {
              // Already formatted as Yes/No in getFieldValue
              displayValue = computedValue
            }
          }

          results.push({
            fieldId,
            fieldName: field.name,
            displayValue,
            enrichmentErrorMessage: errorMessage,
            queueStatus,
          })
        }

        return results
      },
    }),
  }),
})
