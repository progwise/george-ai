import type { Prisma } from '@george-ai/prismaClient'

import { getFieldValue } from '../../domain'
import { type AiListFilterType, AiListFilterTypeValues, getListFiltersWhere } from '../../domain/list/filter'
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
        cache: true
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
      }
    }>
    list: Prisma.AiListGetPayload<{ include: { sources: true } }>
    fields: Prisma.AiListFieldGetPayload<object>[]
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
            displayValue: await getFieldValue(file, field).then((res) => res.value),
            queueStatus: 'unknown',
            enrichmentErrorMessage: 'unknown',
          }))
        },
      }),
    }),
  })

export const ListItemsQueryResult = builder
  .objectRef<{
    list: Prisma.AiListGetPayload<{ include: { sources: true } }>
    fields: Prisma.AiListFieldGetPayload<object>[]
    skip: number
    take: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    filters: { fieldId: string; filterType: AiListFilterType; value: string }[]
    showArchived?: boolean
  }>('ListItemsQueryResult')
  .implement({
    description: 'Query result for AI list files from all source libraries',
    fields: (t) => ({
      items: t.field({
        type: [ListItemQueryResult],
        nullable: { list: false, items: false },
        resolve: async ({ list, fields, skip, take, orderBy, orderDirection, filters, showArchived }) => {
          const fitersWhere = await getListFiltersWhere(filters)
          const files = await prisma.aiLibraryFile.findMany({
            include: { library: true, crawledByCrawler: true, cache: true }, // loads all caches for the file and not only the relevant ones
            where: {
              libraryId: {
                in: list.sources.map((source) => source.libraryId).filter((id): id is string => id !== null),
              },
              ...(showArchived ? {} : { archivedAt: null }),
              ...fitersWhere,
            },
            skip,
            take,
            orderBy: orderBy
              ? {
                  [orderBy]: orderDirection === 'desc' ? 'desc' : 'asc',
                }
              : { name: 'asc' },
          })

          return files.map((file) => ({ file, list, fields }))
        },
      }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      orderBy: t.exposeString('orderBy', { nullable: true }),
      orderDirection: t.exposeString('orderDirection', { nullable: true }),
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
    }),
  })
