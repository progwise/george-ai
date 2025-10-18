import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: ApiKey')

builder.prismaObject('ApiKey', {
  name: 'ApiKey',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    library: t.relation('library', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    user: t.relation('user', { nullable: false }),
    userId: t.exposeString('userId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    lastUsedAt: t.expose('lastUsedAt', { type: 'DateTime', nullable: true }),
  }),
})
