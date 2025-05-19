import { prisma } from '../../prisma'
import { builder } from '../builder'

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
      const { sub, preferred_username, name, given_name, family_name, email } = parsedToken

      // Try to find user by id, email, or username
      let user = await prisma.user.findFirst({
        where: {
          OR: [{ id: sub }, { email }, { username: preferred_username }],
        },
      })

      // Pick a unique field for upsert - id and fallback to username
      const upsertWhere = user && user.id ? { id: user.id } : sub ? { id: sub } : { username: preferred_username }

      const userData = {
        id: sub,
        username: preferred_username,
        email,
        name,
        given_name,
        family_name,
        lastLogin: new Date(),
      }

      user = await prisma.user.upsert({
        ...query,
        where: upsertWhere,
        update: userData,
        create: userData,
      })

      return user
    },
  }),
)

builder.mutationField('createUser', (t) =>
  t.prismaField({
    type: 'User',
    args: {
      username: t.arg.string({ required: true }),
      data: t.arg({ type: UserInput, required: true }),
    },
    resolve: async (_query, _source, { username, data }) => {
      const user = prisma.user.create({
        data: {
          ...data,
          username,
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
