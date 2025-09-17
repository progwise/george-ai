import { EnrichmentStatusValues } from '../../domain'
import { builder } from '../builder'

import './queries'
import './mutations'

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
    fileId: t.exposeString('fileId', { nullable: false }),
    status: t.expose('status', { type: EnrichmentStatus, nullable: false }),
    priority: t.exposeInt('priority', { nullable: false }),
    requestedAt: t.expose('requestedAt', { type: 'DateTime', nullable: false }),
    startedAt: t.expose('startedAt', { type: 'DateTime' }),
    completedAt: t.expose('completedAt', { type: 'DateTime' }),
    error: t.exposeString('error'),
    list: t.relation('list', { nullable: false }),
    field: t.relation('field', { nullable: false }),
    file: t.relation('file', { nullable: false }),
    metadata: t.exposeString('metadata'), // JSON string
  }),
})
