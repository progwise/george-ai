import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: UserProfile')

builder.prismaObject('UserProfile', {
  name: 'UserProfile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    expiresAt: t.expose('expiresAt', { type: 'DateTime' }),
    email: t.exposeString('email', { nullable: false }),
    given_name: t.exposeString('given_name', { nullable: true }),
    family_name: t.exposeString('family_name', { nullable: true }),
    freeConversations: t.exposeInt('freeConversations', { nullable: false }),
    freeMessages: t.exposeInt('freeMessages', { nullable: false }),
    freeStorage: t.exposeInt('freeStorage', { nullable: false }),
    business: t.exposeString('business', { nullable: true }),
    position: t.exposeString('position', { nullable: true }),
    confirmationDate: t.expose('confirmationDate', { type: 'DateTime' }),
  }),
})

const UserProfileInput = builder.inputType('UserProfileInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    given_name: t.string({ required: false }),
    family_name: t.string({ required: false }),
    business: t.string({ required: false }),
    position: t.string({ required: false }),
  }),
})

builder.mutationField('createUserProfile', (t) =>
  t.prismaField({
    type: 'UserProfile',
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { userId }) => {
      const previousRegistration = await prisma.userProfile.findFirst({
        where: { userId },
      })
      if (previousRegistration) {
        throw new Error('User already had a profile')
      }
      const user = await prisma.user.findFirstOrThrow({
        where: { id: userId },
      })
      return prisma.userProfile.create({
        ...query,
        data: {
          userId,
          email: user.email,
          given_name: user.given_name,
          family_name: user.family_name,
          freeConversations: 10,
          freeMessages: 100,
          freeStorage: 1000,
        },
      })
    },
  }),
)

builder.mutationField('confirmUserProfile', (t) =>
  t.prismaField({
    type: 'UserProfile',
    args: {
      registrationId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { registrationId }) => {
      return prisma.userProfile.update({
        ...query,
        where: { id: registrationId },
        data: {
          confirmationDate: new Date(),
        },
      })
    },
  }),
)

builder.mutationField('removeUserProfile', (t) =>
  t.prismaField({
    type: 'UserProfile',
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { userId }) => {
      return prisma.userProfile.delete({
        ...query,
        where: { userId },
      })
    },
  }),
)

builder.mutationField('updateUserProfile', (t) =>
  t.prismaField({
    type: 'UserProfile',
    args: {
      userId: t.arg.string({ required: true }),
      input: t.arg({ type: UserProfileInput, required: true }),
    },
    resolve: async (query, _source, { userId, input }) => {
      return prisma.userProfile.update({
        ...query,
        where: { userId },
        data: input,
      })
    },
  }),
)

builder.queryField('userProfile', (t) =>
  t.prismaField({
    type: 'UserProfile',
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { userId }) => {
      return prisma.userProfile.findFirst({
        ...query,
        where: { userId },
      })
    },
  }),
)
