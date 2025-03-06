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
    lastLogin: t.expose('lastLogin', { type: 'DateTime', nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
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
  t.prismaField({
    type: 'User',
    args: {
      email: t.arg.string(),
    },
    resolve: (query, _source, { email }) => {
      return prisma.user.findUnique({
        ...query,
        where: { email: email },
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
      const parsedToken = JSON.parse(
        Buffer.from(jwtToken.split('.')[1], 'base64').toString(),
      )
      const { preferred_username, name, given_name, family_name, email } =
        parsedToken
      const user = await prisma.user.upsert({
        ...query,
        where: { username: preferred_username },
        update: {
          lastLogin: new Date(),
        },
        create: {
          email,
          name,
          given_name,
          family_name,
          username: preferred_username,
        },
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

builder.queryField('myConversationUsers', (t) =>
  t.prismaField({
    type: ['User'],
    nullable: { list: false, items: false },
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { userId }) => {
      return prisma.user.findMany({
        ...query,
        where: {
          id: { not: userId },
        },
      })
    },
  }),
)
