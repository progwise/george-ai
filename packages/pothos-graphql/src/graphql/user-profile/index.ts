import { sendMail } from '../../mailer'
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
    firstName: t.exposeString('firstName', { nullable: true }),
    lastName: t.exposeString('lastName', { nullable: true }),
    freeMessages: t.exposeInt('freeMessages', { nullable: false }),
    freeStorage: t.exposeInt('freeStorage', { nullable: false }),
    business: t.exposeString('business', { nullable: true }),
    position: t.exposeString('position', { nullable: true }),
    confirmationDate: t.expose('confirmationDate', { type: 'DateTime' }),
    usedMessages: t.field({
      type: 'Int',
      resolve: async (source) => {
        const messageCount = await prisma.aiConversationMessage.count({
          where: {
            sender: {
              userId: source.userId,
            },
          },
        })
        return messageCount
      },
    }),
    usedStorage: t.field({
      type: 'Int',
      resolve: async (source) => {
        const fileSizeSum = await prisma.aiLibraryFile.aggregate({
          where: {
            library: {
              ownerId: source.userId,
            },
          },
          _sum: {
            size: true,
          },
        })

        return fileSizeSum._sum.size || 0
      },
    }),
  }),
})

const UserProfileInput = builder.inputType('UserProfileInput', {
  fields: (t) => ({
    email: t.string({ required: true }),
    firstName: t.string({ required: false }),
    lastName: t.string({ required: false }),
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
          firstName: user.given_name,
          lastName: user.family_name,
          freeMessages: 20,
          freeStorage: 100000,
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

builder.mutationField('confirmUserProfile', (t) =>
  t.prismaField({
    type: 'UserProfile',
    args: {
      profileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { profileId }) => {
      return prisma.userProfile.update({
        ...query,
        where: { id: profileId },
        data: {
          confirmationDate: new Date(),
        },
      })
    },
  }),
)

builder.mutationField('sendConfirmationMail', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      userId: t.arg.string({ required: true }),
      confirmationUrl: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { userId, confirmationUrl }) => {
      // send email
      const profile = await prisma.userProfile.findFirst({
        where: { userId },
      })
      if (!profile) {
        throw new Error('Profile not found')
      }
      console.log('Sending confirmation email to', profile.email)
      const emailInfo = await sendMail(
        profile.email,
        'Please confirm your email',
        'Thx for registering at george-ai.net. Enter the following URL in your browser to confirm your email: ' +
          confirmationUrl,
        'Thx for registering at george-ai.net. Enter the following URL in your browser to confirm your email: <a href="' +
          confirmationUrl +
          '">' +
          confirmationUrl +
          '</a>',
      )
      console.log('Email sent', emailInfo)
      return true
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
