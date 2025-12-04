import { EnrichmentMetadataSchema, EnrichmentStatusValues } from '../../domain'
import { builder } from '../builder'

import './queries'
import './mutations'

import { AiEnrichmentTaskProcessingData } from './processing-data'

console.log('Setting up: AiEnrichments')

export const EnrichmentStatus = builder.enumType('EnrichmentStatus', {
  values: EnrichmentStatusValues,
})

builder.prismaObject('AiEnrichmentTask', {
  name: 'AiEnrichmentTask',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    fieldId: t.exposeString('fieldId', { nullable: false }),
    itemId: t.exposeString('itemId', { nullable: false }),
    status: t.expose('status', { type: EnrichmentStatus, nullable: false }),
    priority: t.exposeInt('priority', { nullable: false }),
    requestedAt: t.expose('requestedAt', { type: 'DateTime', nullable: false }),
    startedAt: t.expose('startedAt', { type: 'DateTime' }),
    completedAt: t.expose('completedAt', { type: 'DateTime' }),
    error: t.exposeString('error'),
    list: t.relation('list', { nullable: false }),
    field: t.relation('field', { nullable: false }),
    item: t.relation('item', { nullable: false }),
    processingData: t.field({
      type: AiEnrichmentTaskProcessingData,
      nullable: true,
      resolve: (parent) => {
        const metadata = JSON.parse(parent.metadata || '{}')
        const parseResult = EnrichmentMetadataSchema.safeParse(metadata)
        if (parseResult.success) {
          return parseResult.data || null
        }
        return null
      },
    }),
    metadata: t.exposeString('metadata'), // JSON string
  }),
})
