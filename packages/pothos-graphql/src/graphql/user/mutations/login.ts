import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { workspace } from '@george-ai/app-domain'
import { user as usr } from '@george-ai/app-domain'

import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('login', (t) =>
  t.field({
    type: builder.simpleObject('LoginResult', {
      fields: (t) => ({
        userId: t.string(),
        avatarUrl: t.string({ nullable: true }),
      }),
    }),
    nullable: false,
    args: {
      jwtToken: t.arg.string({ required: true }),
    },
    resolve: async (_root, { jwtToken }) => {
      const parsedToken = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString())
      const { preferred_username, name, given_name, family_name, email } = parsedToken

      if (!email && !preferred_username) {
        logger.warn('Login attempt with invalid token: missing email or preferred_username', { jwtToken })
        throw new GraphQLError('Invalid token: missing email and username')
      }

      const providerAvatarUrl = await usr.extractAvatarFromToken(parsedToken)

      logger.debug('Login attempt', { preferred_username, email, providerAvatarUrl })

      // Check if user already exists by email first (more reliable than username)
      let user = await prisma.user.findFirst({
        select: { id: true, avatarUrl: true },
        where: { OR: [{ email }, { username: preferred_username }] },
      })

      if (!user) {
        user = await prisma.user.create({
          select: { id: true, avatarUrl: true },
          data: {
            lastLogin: new Date(),
            email,
            name,
            given_name,
            family_name,
            username: preferred_username,
            avatarUrl: providerAvatarUrl,
            defaultWorkspace: {
              connect: {
                id: workspace.SYSTEM_WORKSPACE_ID,
              },
            },
            workspaceMemberships: {
              create: {
                workspaceId: workspace.SYSTEM_WORKSPACE_ID,
                role: 'member',
              },
            },
            profile: {
              create: {
                email,
                firstName: given_name,
                lastName: family_name,
                business: name,
              },
            },
          },
        })
      } else {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            lastLogin: new Date(),
            name,
            given_name,
            family_name,
            ...(usr.isProviderAvatar(user.avatarUrl) ? { avatarUrl: providerAvatarUrl } : {}),
          },
        })
        await prisma.workspaceMember.upsert({
          where: {
            workspaceId_userId: {
              userId: user.id,
              workspaceId: workspace.SYSTEM_WORKSPACE_ID,
            },
          },
          create: {
            userId: user.id,
            workspaceId: workspace.SYSTEM_WORKSPACE_ID,
            role: 'member',
          },
          update: {},
        })
      }

      return { userId: user.id, avatarUrl: user.avatarUrl }
    },
  }),
)
