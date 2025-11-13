import { prisma } from './../../prisma'
import { builder } from './../builder'

import './queries'
import './mutations'

import { FieldSourceType, FieldType } from '../../domain/list'

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
    contentQuery: t.exposeString('contentQuery'),
    // languageModel field removed - now using aiLanguageModel relation
    useVectorStore: t.exposeBoolean('useVectorStore'),
    context: t.relation('context', { nullable: false }),
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
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    fieldId: t.exposeString('fieldId', { nullable: false }),
    field: t.relation('field', { nullable: false }),
    contextFieldId: t.exposeString('contextFieldId', { nullable: false }),
    contextField: t.relation('contextField', { nullable: false }),
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
