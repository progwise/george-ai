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
    activationDate: t.expose('activationDate', { type: 'DateTime' }),
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
    freeMessages: t.int({ required: false }),
    freeStorage: t.int({ required: false }),
  }),
})

builder.mutationField('createUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    resolve: async (query, _source, _args, { user }) => {
      const previousRegistration = await prisma.userProfile.findFirst({
        where: { userId: user.id },
      })
      if (previousRegistration) {
        throw new Error('User already had a profile')
      }
      const currentUser = await prisma.user.findFirstOrThrow({
        where: { id: user.id },
      })
      return prisma.userProfile.create({
        ...query,
        data: {
          userId: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.given_name,
          lastName: currentUser.family_name,
          freeMessages: 20,
          freeStorage: 100000,
        },
      })
    },
  }),
)

builder.mutationField('removeUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    resolve: async (query, _source, _args, { user }) => {
      return prisma.userProfile.delete({
        ...query,
        where: { userId: user.id },
      })
    },
  }),
)

builder.mutationField('updateUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    args: {
      input: t.arg({ type: UserProfileInput, required: true }),
    },
    resolve: async (query, _source, { input }, { user }) => {
      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId: user?.id },
      })

      if (!existingProfile) {
        throw new Error(`User profile not found for userId: ${user.id}`)
      }

      return prisma.userProfile.update({
        ...query,
        where: { userId: user.id },
        data: {
          ...input,
          freeMessages: input.freeMessages ?? existingProfile.freeMessages,
          freeStorage: input.freeStorage ?? existingProfile.freeStorage,
        },
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
    resolve: (query, _source, { profileId }) => {
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
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      confirmationUrl: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { confirmationUrl }, { user }) => {
      const profile = await prisma.userProfile.findFirst({
        where: { userId: user.id },
      })
      if (!profile) {
        throw new Error('Profile not found')
      }

      // Send email to the user
      await sendMail(
        profile.email,
        'Please confirm your email',
        'Thank you for registering at george-ai.net. Enter the following URL in your browser to confirm your email: ' +
          confirmationUrl,
        'Thank you for registering at george-ai.net. Enter the following URL in your browser to confirm your email: <a href="' +
          confirmationUrl +
          '">' +
          confirmationUrl +
          '</a>',
      )

      // Send email to the admin
      const activationUrl = confirmationUrl.replace(profile.id, profile.userId).replace('/confirm', '/admin-confirm')
      await sendMail(
        'info@george-ai.net',
        'Admin Activation Required',
        `A new user profile requires activation. User email: ${profile.email}. Confirm here: ${activationUrl}`,
        `<p>A new user profile requires activation. User email: ${profile.email}. Confirm here: <a href="${activationUrl}">${activationUrl}</a></p>`,
      )

      return true
    },
  }),
)

builder.queryField('userProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    resolve: async (query, _source, _args, { user }) => {
      return prisma.userProfile.findFirst({
        ...query,
        where: { userId: user.id },
      })
    },
  }),
)

builder.mutationField('activateUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    resolve: async (_query, _source, _args, { user }) => {
      const userProfile = await prisma.userProfile.findFirst({
        where: {
          userId: user.id,
        },
      })

      if (!userProfile) {
        throw new Error(`User profile not found for userId: ${user.id}`)
      }

      const updatedProfile = await prisma.userProfile.update({
        where: { id: userProfile.id },
        data: {
          activationDate: new Date(),
        },
      })

      // Send email activation notification to the user
      await sendMail(
        userProfile.email,
        'Profile Activation Successful',
        'Your profile has been successfully activated. You can now access all features.',
        '<p>Your profile has been successfully activated. You can now access all features.</p>',
      )

      return updatedProfile
    },
  }),
)
