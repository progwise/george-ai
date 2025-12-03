import { builder } from '../builder'

import './mutations'
import './queries'

console.log('Setting up: Workspace')

builder.prismaObject('Workspace', {
  name: 'Workspace',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    slug: t.exposeString('slug', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    isDefault: t.withAuth({ isLoggedIn: true }).boolean({
      nullable: false,
      resolve: async (workspace, _args, ctx) => {
        const user = ctx.session.user
        return workspace.id === user.defaultWorkspaceId
      },
    }),
    members: t.relation('members', { nullable: false }),
    invitations: t.relation('invitations', { nullable: false }),
    libraries: t.relation('libraries', { nullable: false }),
    assistants: t.relation('assistants', { nullable: false }),
    lists: t.relation('lists', { nullable: false }),
  }),
})

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
