import type { Prisma } from '@george-ai/prismaClient'

import { getFieldValue } from '../../domain'
import {
  type AiListFilterType,
  AiListFilterTypeValues,
  getListFiltersWhere,
  getListSortingOrderBy,
} from '../../domain/list'
import { prisma } from '../../prisma'
import { builder } from '../builder'

export const AiListFilterEnumType = builder.enumType('AiListFilterType', {
  values: AiListFilterTypeValues,
})

export const AiListFilterInput = builder.inputType('AiListFilterInput', {
  fields: (t) => ({
    fieldId: t.string({ required: true }),
    filterType: t.field({ type: AiListFilterEnumType, required: true }),
    value: t.string({ required: true }),
  }),
})

export const AiListSortingInput = builder.inputType('AiListSortingInput', {
  fields: (t) => ({
    fieldId: t.string({ required: true }),
    direction: t.field({
      type: builder.enumType('AiListSortingDirection', { values: ['asc', 'desc'] }),
      required: true,
    }),
  }),
})

export const FieldValueResult = builder
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

export const ListItemResult = builder
  .objectRef<
    Prisma.AiLibraryFileGetPayload<{
      include: {
        library: true
        crawledByCrawler: true
      }
    }>
  >('ListItemResult')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      type: t.field({
        type: 'String',
        nullable: false,
        resolve: () => 'file',
      }),
      createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: true }),
      name: t.exposeString('name', { nullable: false }),
      originUri: t.exposeString('originUri', { nullable: true }),
      docPath: t.exposeString('docPath', { nullable: true }),
      mimeType: t.exposeString('mimeType', { nullable: false }),
      size: t.exposeInt('size', { nullable: true }),
      uploadedAt: t.expose('uploadedAt', { type: 'DateTime', nullable: true }),
      libraryId: t.exposeString('libraryId', {
        nullable: false,
      }),
      libraryName: t.field({
        type: 'String',
        nullable: false,
        resolve: (file) => file.library.name,
      }),
      dropError: t.exposeString('dropError', { nullable: true }),
      originModificationDate: t.expose('originModificationDate', { type: 'DateTime', nullable: true }),
      archivedAt: t.expose('archivedAt', { type: 'DateTime', nullable: true }),
    }),
  })

export const ListItemQueryResult = builder
  .objectRef<{
    file: Prisma.AiLibraryFileGetPayload<{
      include: {
        library: true
        crawledByCrawler: true
        cache: true
        enrichmentTasks: {
          select: { fieldId: true; status: true }
        }
      }
    }>
    list: Prisma.AiListGetPayload<{ include: { sources: true } }>
    fields: Prisma.AiListFieldGetPayload<{
      select: {
        id: true
        name: true
        sourceType: true
        fileProperty: true
        type: true
      }
    }>[]
  }>('ListItemQueryResult')
  .implement({
    fields: (t) => ({
      origin: t.field({
        type: ListItemResult,
        nullable: false,
        resolve: (root) => {
          return root.file
        },
      }),
      values: t.field({
        type: [FieldValueResult],
        nullable: { list: false, items: false },
        resolve: async ({ fields, file }) => {
          return fields.map(async (field) => ({
            fieldId: field.id,
            fieldName: field.name,
            ...(() => {
              const { value, errorMessage } = getFieldValue(file, field)
              return {
                displayValue: value ? value : errorMessage,
                queueStatus: file.enrichmentTasks.length < 1 ? 'done' : file.enrichmentTasks[0].status, // TODO: fill from EntchmentTasks
                enrichmentErrorMessage: errorMessage,
              }
            })(),
          }))
        },
      }),
    }),
  })

export const ListItemsQueryResult = builder
  .objectRef<{
    list: Prisma.AiListGetPayload<{ include: { sources: true } }>
    fields: Prisma.AiListFieldGetPayload<{
      select: {
        id: true
        name: true
        sourceType: true
        fileProperty: true
        type: true
      }
    }>[]
    skip: number
    take: number
    sorting: { fieldId: string; direction: 'asc' | 'desc' }[]
    filters: { fieldId: string; filterType: AiListFilterType; value: string }[]
    showArchived?: boolean
  }>('ListItemsQueryResult')
  .implement({
    description: 'Query result for AI list files from all source libraries',
    fields: (t) => ({
      items: t.field({
        type: [ListItemQueryResult],
        nullable: { list: false, items: false },
        resolve: async ({ list, fields, skip, take, sorting, filters, showArchived }) => {
          const fitersWhere = await getListFiltersWhere(filters)
          const sortingOrderBy = await getListSortingOrderBy(sorting, fields)
          const files = await prisma.aiLibraryFile.findMany({
            include: {
              library: true,
              crawledByCrawler: true,
              cache: {
                where: { fieldId: { in: fields.map((field) => field.id) } },
              },
              enrichmentTasks: {
                where: { completedAt: null, listId: list.id },
                select: { fieldId: true, status: true },
              },
            }, // loads all caches for the file and not only the relevant ones
            where: {
              libraryId: {
                in: list.sources.map((source) => source.libraryId).filter((id): id is string => id !== null),
              },
              ...(showArchived ? {} : { archivedAt: null }),
              ...fitersWhere,
            },
            skip,
            take,
            orderBy: [...sortingOrderBy],
          })

          return files.map((file) => ({ file, list, fields }))
        },
      }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      showArchived: t.exposeBoolean('showArchived', { nullable: true }),
      count: t.field({
        type: 'Int',
        nullable: false,
        resolve: async ({ list, filters, showArchived }) => {
          const fitersWhere = await getListFiltersWhere(filters)

          const where: Prisma.AiLibraryFileWhereInput = {
            libraryId: {
              in: list.sources.map((source) => source.libraryId).filter((id): id is string => id !== null),
            },
            ...(showArchived ? {} : { archivedAt: null }),
            ...fitersWhere,
          }
          return prisma.aiLibraryFile.count({
            where,
          })
        },
      }),
      unfilteredCount: t.field({
        type: 'Int',
        nullable: false,
        resolve: async ({ list, showArchived }) => {
          const where: Prisma.AiLibraryFileWhereInput = {
            libraryId: {
              in: list.sources.map((source) => source.libraryId).filter((id): id is string => id !== null),
            },
            ...(showArchived ? {} : { archivedAt: null }),
          }
          return prisma.aiLibraryFile.count({
            where,
          })
        },
      }),
    }),
  })
