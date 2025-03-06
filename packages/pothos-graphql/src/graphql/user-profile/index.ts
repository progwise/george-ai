import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: UserProfile')

builder.prismaObject('UserProfile', {
  name: 'UserProfile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
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

const RegistrationInput = builder.inputType('UserProfileInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    given_name: t.string({ required: false }),
    family_name: t.string({ required: false }),
    business: t.string({ required: false }),
    position: t.string({ required: false }),
  }),
})

builder.mutationField('register', (t) =>
  t.prismaField({
    type: 'UserProfile',
    args: {
      userId: t.arg.string({ required: true }),
      input: t.arg({ type: RegistrationInput, required: true }),
    },
    resolve: async (query, _source, { userId, input }) => {
      const previousRegistration = await prisma.userProfile.findFirst({
        where: { userId },
      })
      if (previousRegistration) {
        throw new Error('User already registered')
      }
      return prisma.userProfile.create({
        ...query,
        data: {
          ...input,
          userId,
          freeConversations: 10,
          freeMessages: 100,
          freeStorage: 1000,
        },
      })
    },
  }),
)

builder.mutationField('confirmRegistration', (t) =>
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

builder.mutationField('deleteUserProfile', (t) =>
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
