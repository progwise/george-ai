import { getListStatistics } from '@prisma/client/sql'

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
    fields: t.relation('fields', { nullable: false, query: { orderBy: { order: 'asc' } } }),
    sources: t.relation('sources', { nullable: false }),
    enrichmentTasks: t.relation('enrichmentTasks', { nullable: false }),
    statistics: t.field({
      type: [
        builder
          .objectRef<{
            listId: string
            fieldId: string
            fieldName: string
            itemCount: number
            cacheCount: number
            valuesCount: number
            completedTasksCount: number
            failedTasksCount: number
            pendingTasksCount: number
            processingTasksCount: number
          }>('AiListFieldStatistics')
          .implement({
            fields: (t) => ({
              listId: t.exposeString('listId', { nullable: false }),
              fieldId: t.exposeString('fieldId', { nullable: false }),
              fieldName: t.exposeString('fieldName', { nullable: false }),
              itemCount: t.exposeInt('itemCount', { nullable: false }),
              cacheCount: t.exposeInt('cacheCount', { nullable: false }),
              valuesCount: t.exposeInt('valuesCount', { nullable: false }),
              completedTasksCount: t.exposeInt('completedTasksCount', { nullable: false }),
              failedTasksCount: t.exposeInt('failedTasksCount', { nullable: false }),
              pendingTasksCount: t.exposeInt('pendingTasksCount', { nullable: false }),
              processingTasksCount: t.exposeInt('processingTasksCount', { nullable: false }),
            }),
          }),
      ],
      nullable: false,
      resolve: async (parent) => {
        //TODO
        const result = await prisma.$queryRawTyped(getListStatistics(parent.id))
        return result.map((r) => ({
          listId: r.listId,
          fieldId: r.fieldId,
          fieldName: r.fieldName,
          itemCount: Number(r.itemCount),
          cacheCount: Number(r.cacheCount),
          valuesCount: Number(r.valuesCount),
          completedTasksCount: Number(r.completedTasksCount),
          failedTasksCount: Number(r.failedTasksCount),
          pendingTasksCount: Number(r.pendingTasksCount),
          processingTasksCount: Number(r.processingTasksCount),
        }))
      },
    }),
  }),
})
