import { extractAvatarFromToken, getPreferredAvatarUrl, shouldUpdateAvatarFromProvider } from '../../avatar-provider'
import { prisma } from '../../prisma'
import { builder } from '../builder'

import './user-management'

console.log('Setting up: User')

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
    lastLogin: t.expose('lastLogin', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
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

export const UserInput = builder.inputType('UserInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    name: t.string({ required: true }),
    given_name: t.string({ required: false }),
    family_name: t.string({ required: false }),
    avatarUrl: t.string({ required: false }),
  }),
})

builder.queryField('user', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    args: {
      email: t.arg.string(),
    },
    resolve: (query, _source, { email }) => {
      return prisma.user.findUnique({
        ...query,
        where: { email },
      })
    },
  }),
)

builder.mutationField('login', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      jwtToken: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { jwtToken }) => {
      const parsedToken = JSON.parse(Buffer.from(jwtToken.split('.')[1], 'base64').toString())
      const { preferred_username, name, given_name, family_name, email } = parsedToken

      const providerAvatarUrl = await extractAvatarFromToken(parsedToken)

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
        const shouldUpdateAvatar = shouldUpdateAvatarFromProvider(
          existingUser.avatarUrl || null,
          providerAvatarUrl,
          isNewUser,
        )

        // Get the preferred avatar URL
        const preferredAvatarUrl = shouldUpdateAvatar
          ? getPreferredAvatarUrl(providerAvatarUrl, existingUser.avatarUrl)
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
      const shouldUpdateAvatar = shouldUpdateAvatarFromProvider(
        existingByUsername?.avatarUrl || null,
        providerAvatarUrl,
        isCreatingNewUser,
      )

      // Get the preferred avatar URL for new user
      const preferredAvatarUrlForNew = getPreferredAvatarUrl(providerAvatarUrl, null)

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

builder.queryField('users', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['User'],
    nullable: { list: false, items: false },
    resolve: async (query, _source, _args, context) => {
      return prisma.user.findMany({
        ...query,
        where: {
          id: { not: context.session.user.id },
        },
      })
    },
  }),
)

builder.mutationField('updateUserAvatar', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    args: {
      avatarUrl: t.arg.string({ required: false }),
    },
    resolve: async (query, _source, { avatarUrl }, context) => {
      return prisma.user.update({
        ...query,
        where: { id: context.session.user.id },
        data: {
          avatarUrl,
        },
      })
    },
  }),
)
