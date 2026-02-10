import { builder } from '../builder'

builder.prismaObject('WorkspaceMember', {
  name: 'WorkspaceMember',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    role: t.exposeString('role', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    workspace: t.relation('workspace', { nullable: false }),
    user: t.relation('user', { nullable: false }),
  }),
})
