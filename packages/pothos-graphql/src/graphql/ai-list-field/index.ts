import { prisma } from '@george-ai/app-domain'

import { builder } from './../builder'

import './queries'
import './mutations'

import { FieldContextType, FieldSourceType, FieldType } from '../../domain/list'

console.log('Setting up: AiListField')

builder.prismaObject('AiListField', {
  name: 'AiListField',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    list: t.relation('list', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    type: t.field({ type: 'ListFieldType', nullable: false, resolve: (field) => field.type as FieldType }),
    order: t.exposeInt('order', { nullable: false }),
    sourceType: t.field({
      type: 'ListFieldSourceType',
      nullable: false,
      resolve: (field) => field.sourceType as FieldSourceType,
    }),
    fileProperty: t.exposeString('fileProperty'),
    prompt: t.exposeString('prompt'),
    failureTerms: t.exposeString('failureTerms'),
    languageModel: t.relation('languageModel'),
    context: t.relation('context', { nullable: false }),
    contextFieldReferences: t.prismaField({
      type: ['AiListFieldContext'],
      nullable: false,
      resolve: async (query, parent) => {
        return await prisma.aiListFieldContext.findMany({
          ...query,
          where: { fieldId: parent.id, contextType: 'fieldReference' },
          orderBy: { createdAt: 'asc' },
        })
      },
    }),
    contextVectorSearches: t.prismaField({
      type: ['AiListFieldContext'],
      nullable: false,
      resolve: async (query, parent) => {
        return await prisma.aiListFieldContext.findMany({
          ...query,
          where: { fieldId: parent.id, contextType: 'vectorSearch' },
          orderBy: { createdAt: 'asc' },
        })
      },
    }),
    contextWebFetches: t.prismaField({
      type: ['AiListFieldContext'],
      nullable: false,
      resolve: async (query, parent) => {
        return await prisma.aiListFieldContext.findMany({
          ...query,
          where: { fieldId: parent.id, contextType: 'webFetch' },
          orderBy: { createdAt: 'asc' },
        })
      },
    }),
    contextFullContents: t.prismaField({
      type: ['AiListFieldContext'],
      nullable: false,
      resolve: async (query, parent) => {
        return await prisma.aiListFieldContext.findMany({
          ...query,
          where: { fieldId: parent.id, contextType: 'fullContent' },
          orderBy: { createdAt: 'asc' },
        })
      },
    }),
    pendingItemsCount: t.field({
      type: 'Int',
      nullable: false,
      resolve: async (parent) => {
        const count = await prisma.aiEnrichmentTask.count({
          where: { listId: parent.listId, fieldId: parent.id, status: 'pending' },
        })
        return count
      },
    }),
    processingItemsCount: t.field({
      type: 'Int',
      nullable: false,
      resolve: async (parent) => {
        const count = await prisma.aiEnrichmentTask.count({
          where: { listId: parent.listId, fieldId: parent.id, status: 'processing' },
        })
        return count
      },
    }),
  }),
})

builder.prismaObject('AiListFieldContext', {
  name: 'AiListFieldContext',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    fieldId: t.exposeString('fieldId', { nullable: false }),
    field: t.relation('field', { nullable: false }),
    contextType: t.field({
      type: 'ListFieldContextType',
      nullable: false,
      resolve: (context) => context.contextType as FieldContextType,
    }),
    contextFieldId: t.exposeString('contextFieldId'),
    contextField: t.relation('contextField'),
    contextQuery: t.string({
      resolve: (context) => (context.contextQuery ? JSON.stringify(context.contextQuery) : null),
    }),
    maxContentTokens: t.exposeInt('maxContentTokens'),
  }),
})

builder.prismaObject('AiListItemCache', {
  name: 'AiListItemCache',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    fieldId: t.exposeString('fieldId', { nullable: false }),
    valueString: t.exposeString('valueString'),
    valueNumber: t.exposeFloat('valueNumber'),
    valueDate: t.expose('valueDate', { type: 'DateTime' }),
    valueBoolean: t.exposeBoolean('valueBoolean'),
    enrichmentErrorMessage: t.exposeString('enrichmentErrorMessage'),
  }),
})
