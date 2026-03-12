import { builder } from '../builder'

export interface CurrentUser {
  userId: string
  name: string
  username: string
  email: string
  avatarUrl: string | null
  isAdmin: boolean
  selectedWorkspaceId: string
  defaultWorkspaceId: string
  lastLogin: Date | null
}

builder.objectRef<CurrentUser>('CurrentUser').implement({
  fields: (t) => ({
    userId: t.exposeID('userId', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    username: t.exposeString('username', { nullable: false }),
    email: t.exposeString('email', { nullable: false }),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    isAdmin: t.exposeBoolean('isAdmin', { nullable: false }),
    selectedWorkspaceId: t.exposeID('selectedWorkspaceId', { nullable: false }),
    defaultWorkspaceId: t.exposeID('defaultWorkspaceId', { nullable: false }),
    lastLogin: t.expose('lastLogin', { type: 'DateTime', nullable: true }),
  }),
})
