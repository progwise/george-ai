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
    user: t.relation('list', { nullable: false }),
  }),
})

builder.prismaObject('AiListField', {
  name: 'AiListField',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    type: t.exposeString('type', { nullable: false }),
    order: t.exposeInt('order', { nullable: false }),
    sourceType: t.exposeString('sourceType', { nullable: false }),
    fileProperty: t.exposeString('fileProperty'),
    prompt: t.exposeString('prompt'),
    languageModel: t.exposeString('languageModel'),
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
    fields: t.relation('fields', { nullable: false }),
    sources: t.relation('sources', { nullable: false }),
  }),
})
