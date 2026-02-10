import { builder } from '../builder'

builder.prismaObject('WorkspaceInvitation', {
  name: 'WorkspaceInvitation',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    email: t.exposeString('email', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime', nullable: false }),
    acceptedAt: t.expose('acceptedAt', { type: 'DateTime', nullable: true }),
    workspace: t.relation('workspace', { nullable: false }),
    inviter: t.relation('inviter', { nullable: false }),
  }),
})
