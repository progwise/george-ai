import { builder } from '../builder'

builder.prismaObject('ApiKey', {
  name: 'ApiKey',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    workspace: t.relation('workspace', { nullable: false }),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    user: t.relation('user', { nullable: false }),
    userId: t.exposeString('userId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    lastUsedAt: t.expose('lastUsedAt', { type: 'DateTime', nullable: true }),
  }),
})
