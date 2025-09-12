import { prisma } from '../../prisma'
import { builder } from '../builder'

import './queries'
import './mutations'

console.log('Setting up: AiList')

builder.prismaObject('AiListParticipant', {
  name: 'AiListParticipant',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    list: t.relation('list', { nullable: false }),
    userId: t.exposeString('userId', { nullable: false }),
    user: t.relation('user', { nullable: false }),
  }),
})

builder.prismaObject('AiListField', {
  name: 'AiListField',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    list: t.relation('list', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    type: t.exposeString('type', { nullable: false }),
    order: t.exposeInt('order', { nullable: false }),
    sourceType: t.exposeString('sourceType', { nullable: false }),
    fileProperty: t.exposeString('fileProperty'),
    prompt: t.exposeString('prompt'),
    contentQuery: t.exposeString('contentQuery'),
    languageModel: t.exposeString('languageModel'),
    useVectorStore: t.exposeBoolean('useVectorStore'),
    context: t.relation('context', { nullable: false }),
    pendingItemsCount: t.field({
      type: 'Int',
      nullable: false,
      resolve: async (parent) => {
        const count = await prisma.aiListEnrichmentQueue.count({
          where: { listId: parent.listId, fieldId: parent.id, status: 'pending' },
        })
        return count
      },
    }),
    processingItemsCount: t.field({
      type: 'Int',
      nullable: false,
      resolve: async (parent) => {
        const count = await prisma.aiListEnrichmentQueue.count({
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

builder.prismaObject('AiListSource', {
  name: 'AiListSource',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    libraryId: t.exposeString('libraryId'),
    library: t.relation('library', { nullable: true }),
  }),
})

builder.prismaObject('AiListEnrichmentQueue', {
  name: 'AiListEnrichmentQueue',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    fieldId: t.exposeString('fieldId', { nullable: false }),
    fileId: t.exposeString('fileId', { nullable: false }),
    status: t.exposeString('status', { nullable: false }),
    priority: t.exposeInt('priority', { nullable: false }),
    requestedAt: t.expose('requestedAt', { type: 'DateTime', nullable: false }),
    startedAt: t.expose('startedAt', { type: 'DateTime' }),
    completedAt: t.expose('completedAt', { type: 'DateTime' }),
    error: t.exposeString('error'),
    list: t.relation('list', { nullable: false }),
    field: t.relation('field', { nullable: false }),
    file: t.relation('file', { nullable: false }),
  }),
})

builder.prismaObject('AiList', {
  name: 'AiList',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    ownerId: t.exposeString('ownerId', { nullable: false }),
    owner: t.relation('owner', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    participants: t.relation('participants', { nullable: false }),
    users: t.prismaField({
      type: ['User'],
      nullable: false,
      select: { participants: { select: { user: true } } },
      resolve: async (query, list) => {
        return await prisma.user.findMany({
          where: { listParticipations: { some: { listId: list.id } } },
          ...query,
        })
      },
    }),
    fields: t.relation('fields', { nullable: false }),
    sources: t.relation('sources', { nullable: false }),
    enrichmentQueue: t.relation('enrichmentQueue', { nullable: false }),
  }),
})
