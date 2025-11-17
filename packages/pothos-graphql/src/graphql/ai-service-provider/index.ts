import { builder } from '../builder'

import './mutations'
import './queries'

builder.prismaObject('AiServiceProvider', {
  name: 'AiServiceProvider',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    workspaceId: t.exposeString('workspaceId', { nullable: false }),
    provider: t.exposeString('provider', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    enabled: t.exposeBoolean('enabled', { nullable: false }),
    baseUrl: t.exposeString('baseUrl', { nullable: true }),
    // apiKey is intentionally NOT exposed for security
    vramGb: t.exposeInt('vramGb', { nullable: true }),
    createdBy: t.exposeString('createdBy', { nullable: true }),
    updatedBy: t.exposeString('updatedBy', { nullable: true }),
    workspace: t.relation('workspace', { nullable: false }),
  }),
})
