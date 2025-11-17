import { builder } from '../builder'

// TODO: Implement in Phase 2
// import './mutations'
// import './queries'
console.log('Setting up: Workspace')

builder.prismaObject('Workspace', {
  name: 'Workspace',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    slug: t.exposeString('slug', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    members: t.relation('members', { nullable: false }),
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
