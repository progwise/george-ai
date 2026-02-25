import { prisma } from '@george-ai/app-database'

import { builder } from '../builder'

builder.prismaObject('User', {
  name: 'User',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    username: t.exposeString('username', { nullable: false }),
    email: t.exposeString('email', { nullable: false }),
    name: t.exposeString('name', { nullable: true }),
    given_name: t.exposeString('given_name', { nullable: true }),
    family_name: t.exposeString('family_name', { nullable: true }),
    avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    isAdmin: t.exposeBoolean('isAdmin', { nullable: false }),
    defaultWorkspaceId: t.exposeID('defaultWorkspaceId', { nullable: false }),
    lastLogin: t.expose('lastLogin', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    apiKeyCount: t.relationCount('apiKeys', { nullable: false }),
    registered: t.field({
      type: 'Boolean',
      resolve: async (source) => {
        const count = await prisma.userProfile.count({
          where: { userId: source.id },
        })
        return count > 0
      },
    }),
    profile: t.prismaField({
      type: 'UserProfile',
      resolve: async (query, source) => {
        return prisma.userProfile.findFirst({
          ...query,
          where: { userId: source.id },
        })
      },
    }),
  }),
})
