import { prisma } from '@george-ai/app-database'
import { workspace } from '@george-ai/app-domain'
import { user as usr } from '@george-ai/app-domain'

// extractAvatarFromToken, getPreferredAvatarUrl, shouldUpdateAvatarFromProvider
import { builder } from '../../builder'
import { logger } from '../../common'

builder.mutationField('login', (t) =>
  t.prismaField({
    type: 'User',
    nullable: false,
    args: {
      jwtToken: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { jwtToken }) => {
      const parsedToken = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString())
      const { preferred_username, name, given_name, family_name, email } = parsedToken

      const providerAvatarUrl = await usr.extractAvatarFromToken(parsedToken)

      logger.debug('Login attempt', { preferred_username, email, providerAvatarUrl })

      // Check if user already exists by email first (more reliable than username)
      const existingUser = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          username: true,
          avatarUrl: true,
          email: true,
          name: true,
          given_name: true,
          family_name: true,
          lastLogin: true,
          createdAt: true,
          updatedAt: true,
          profile: true,
          isAdmin: true,
        },
      })

      if (existingUser) {
        // User exists with this email, update their info
        const isNewUser = false
        const shouldUpdateAvatar = usr.shouldUpdateAvatarFromProvider(
          existingUser.avatarUrl || null,
          providerAvatarUrl,
          isNewUser,
        )

        // Get the preferred avatar URL
        const preferredAvatarUrl = shouldUpdateAvatar
          ? usr.getPreferredAvatarUrl(providerAvatarUrl, existingUser.avatarUrl)
          : existingUser.avatarUrl

        const user = await prisma.user.update({
          ...query,
          where: { email },
          data: {
            lastLogin: new Date(),
            username: preferred_username,
            name,
            given_name,
            family_name,
            avatarUrl: preferredAvatarUrl,
          },
        })

        return user
      }

      // Check if username exists (different email)
      const existingByUsername = await prisma.user.findUnique({
        where: { username: preferred_username },
        select: { avatarUrl: true },
      })

      const isCreatingNewUser = !existingByUsername
      const shouldUpdateAvatar = usr.shouldUpdateAvatarFromProvider(
        existingByUsername?.avatarUrl || null,
        providerAvatarUrl,
        isCreatingNewUser,
      )

      // Get the preferred avatar URL for new user
      const preferredAvatarUrlForNew = usr.getPreferredAvatarUrl(providerAvatarUrl, null)

      // No user exists with this email, safe to create or upsert by username
      const user = await prisma.user.upsert({
        ...query,
        where: { username: preferred_username },
        update: {
          lastLogin: new Date(),
          email,
          name,
          given_name,
          family_name,
          avatarUrl: shouldUpdateAvatar ? preferredAvatarUrlForNew : existingByUsername?.avatarUrl,
        },
        create: {
          email,
          name,
          given_name,
          family_name,
          username: preferred_username,
          avatarUrl: preferredAvatarUrlForNew,
          defaultWorkspace: {
            connect: {
              id: workspace.SYSTEM_WORKSPACE_ID,
            },
          },
          workspaceMemberships: {
            create: {
              workspaceId: workspace.SYSTEM_WORKSPACE_ID,
              role: 'owner',
            },
          },
          profile: {
            create: {
              email,
              firstName: given_name,
              lastName: family_name,
              business: name,
              freeMessages: 20,
              freeStorage: 100000,
            },
          },
        },
      })

      return user
    },
  }),
)
