import Prisma from '@george-ai/prismaClient'
import { dateTimeString } from '@george-ai/web-utils'

import {
  canAccessLibraryOrThrow,
  canAccessListOrThrow,
  deleteFile,
  dropAllLibraryFiles,
  dropFileById,
  findCacheValue,
  getFieldValue,
} from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

import './process-file'
import './read-file'
import './file-chunks'

console.log('Setting up: AiLibraryFile')

// Type for field value results
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

export const AiLibraryFile = builder.prismaObject('AiLibraryFile', {
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
    chunks: t.exposeInt('chunks', { nullable: true }),
    uploadedAt: t.expose('uploadedAt', { type: 'DateTime', nullable: true }),
    processedAt: t.expose('processedAt', {
      type: 'DateTime',
      nullable: true,
    }),
    processingStartedAt: t.expose('processingStartedAt', { type: 'DateTime', nullable: true }),
    processingEndedAt: t.expose('processingEndedAt', { type: 'DateTime', nullable: true }),
    processingErrorAt: t.expose('processingErrorAt', { type: 'DateTime', nullable: true }),
    processingErrorMessage: t.exposeString('processingErrorMessage', { nullable: true }),
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
    cache: t.relation('cache', { nullable: false }),
    fieldValues: t.withAuth({ isLoggedIn: true }).field({
      type: [FieldValueResult],
      nullable: { list: false, items: false },
      args: {
        fieldIds: t.arg.stringList({ required: true }),
        language: t.arg.string({ required: true }),
      },
      resolve: async (file, { fieldIds, language }, context) => {
        // Verify user has access to the file's library
        await canAccessLibraryOrThrow(file.libraryId, context.session.user.id)

        // Get all field definitions with their associated lists
        const fields = await prisma.aiListField.findMany({
          where: { id: { in: fieldIds } },
          include: {
            list: {
              include: { participants: true },
            },
          },
        })

        // Check authorization for each field's list
        for (const field of fields) {
          await canAccessListOrThrow(field.list.id, context.session.user.id)
        }

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

export const AiLibraryFileInput = builder.inputType('AiLibraryFileInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    originUri: t.string({ required: true }),
    mimeType: t.string({ required: true }),
    libraryId: t.string({ required: true }),
  }),
})

builder.mutationField('prepareFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    args: {
      data: t.arg({ type: AiLibraryFileInput, required: true }),
    },
    resolve: async (query, _source, { data }) => {
      const library = await prisma.aiLibrary.findUnique({
        where: { id: data.libraryId },
      })
      if (!library) {
        throw new Error(`Library not found: ${data.libraryId}`)
      }
      return await prisma.aiLibraryFile.create({
        ...query,
        data,
      })
    },
  }),
)

const LibraryFileQueryResult = builder
  .objectRef<{ libraryId: string; take: number; skip: number; showArchived?: boolean }>('AiLibraryFileQueryResult')
  .implement({
    description: 'Query result for AI library files',
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      library: t.withAuth({ isLoggedIn: true }).prismaField({
        type: 'AiLibrary',
        nullable: false,
        resolve: async (query, root, _args, context) => {
          const libraryUsers = await prisma.aiLibrary.findFirstOrThrow({
            where: { id: root.libraryId },
            select: { ownerId: true, participants: { select: { userId: true } } },
          })
          if (
            libraryUsers.ownerId !== context.session.user.id &&
            !libraryUsers.participants.some((participant) => participant.userId === context.session.user.id)
          ) {
            throw new Error('You do not have access to this library')
          }
          return prisma.aiLibrary.findUniqueOrThrow({ where: { id: root.libraryId } })
        },
      }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      showArchived: t.exposeBoolean('showArchived', { nullable: true }),
      count: t.withAuth({ isLoggedIn: true }).field({
        type: 'Int',
        nullable: false,
        resolve: async (root, _args, context) => {
          const libraryUsers = await prisma.aiLibrary.findFirstOrThrow({
            where: { id: root.libraryId },
            select: { ownerId: true, participants: { select: { userId: true } } },
          })
          if (
            libraryUsers.ownerId !== context.session.user.id &&
            !libraryUsers.participants.some((participant) => participant.userId === context.session.user.id)
          ) {
            throw new Error('You do not have access to this library')
          }
          console.log('Counting AI library files for library:', root.libraryId)
          return prisma.aiLibraryFile.count({
            where: {
              libraryId: root.libraryId,
              ...(root.showArchived ? {} : { archivedAt: null }),
            },
          })
        },
      }),
      archivedCount: t.withAuth({ isLoggedIn: true }).field({
        type: 'Int',
        nullable: false,
        resolve: async (root, _args, context) => {
          const libraryUsers = await prisma.aiLibrary.findFirstOrThrow({
            where: { id: root.libraryId },
            select: { ownerId: true, participants: { select: { userId: true } } },
          })
          if (
            libraryUsers.ownerId !== context.session.user.id &&
            !libraryUsers.participants.some((participant) => participant.userId === context.session.user.id)
          ) {
            throw new Error('You do not have access to this library')
          }
          console.log('Counting archived AI library files for library:', root.libraryId)
          return prisma.aiLibraryFile.count({
            where: {
              libraryId: root.libraryId,
              archivedAt: { not: null }, // Only archived files
            },
          })
        },
      }),
      files: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['AiLibraryFile'],
        nullable: false,
        resolve: async (query, root, args, context) => {
          const libraryUsers = await prisma.aiLibrary.findFirstOrThrow({
            where: { id: root.libraryId },
            select: { ownerId: true, participants: { select: { userId: true } } },
          })
          if (
            libraryUsers.ownerId !== context.session.user.id &&
            !libraryUsers.participants.some((participant) => participant.userId === context.session.user.id)
          ) {
            throw new Error('You do not have access to this library')
          }
          console.log('Fetching AI library files for library:', query)
          return prisma.aiLibraryFile.findMany({
            ...query,
            where: {
              libraryId: root.libraryId,
              ...(root.showArchived ? {} : { archivedAt: null }),
            },
            orderBy: { createdAt: 'desc' },
            take: root.take ?? 10,
            skip: root.skip ?? 0,
          })
        },
      }),
    }),
  })

builder.queryField('aiLibraryFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _parent, { libraryId, fileId }) => {
      // TODO: Check access rights
      const file = await prisma.aiLibraryFile.findFirstOrThrow({ where: { libraryId, id: fileId } })
      return file
    },
  }),
)

builder.queryField('aiLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: LibraryFileQueryResult,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      take: t.arg.int({ required: true, defaultValue: 20 }),
      showArchived: t.arg.boolean({ required: false, defaultValue: false }),
    },
    resolve: (_root, args) => {
      return {
        libraryId: args.libraryId,
        take: args.take ?? 10,
        skip: args.skip ?? 0,
        showArchived: args.showArchived ?? false,
      }
    },
  }),
)

const FileDropResult = builder
  .objectRef<{
    deletedFile?: Prisma.AiLibraryFile | null
    dropError?: string | null
  }>('FileDropResult')
  .implement({
    fields: (t) => ({
      deletedFile: t.prismaField({
        type: 'AiLibraryFile',
        nullable: true,
        resolve: (_query, parent) => parent.deletedFile,
      }),
      dropError: t.exposeString('dropError', { nullable: true }),
    }),
  })

builder.mutationField('dropFile', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: FileDropResult,
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId }, context) => {
      return await dropFileById(fileId, context.session.user.id)
    },
  }),
)

builder.mutationField('dropFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [FileDropResult],
    nullable: { list: false, items: false },
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId }, context) => {
      return await dropAllLibraryFiles(libraryId, context.session.user.id)
    },
  }),
)

builder.mutationField('cancelFileUpload', (t) =>
  t.field({
    type: 'Boolean',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId, libraryId }) => {
      await deleteFile(fileId, libraryId)
      return true
    },
  }),
)
