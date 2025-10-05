import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: User Management')

const ManagedUser = builder
  .objectRef<{
    id: string
    username: string
    email: string
    name?: string | null
    given_name?: string | null
    family_name?: string | null
    isAdmin: boolean
    lastLogin?: Date | null
    createdAt: Date
    updatedAt?: Date | null
    registered: boolean
    business?: string | null
    position?: string | null
    confirmationDate?: Date | null
    activationDate?: Date | null
    avatarUrl?: string | null
  }>('ManagedUser')
  .implement({
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
      registered: t.exposeBoolean('registered'),
      business: t.exposeString('business', { nullable: true }),
      position: t.exposeString('position', { nullable: true }),
      confirmationDate: t.expose('confirmationDate', { type: 'DateTime', nullable: true }),
      activationDate: t.expose('activationDate', { type: 'DateTime', nullable: true }),
      avatarUrl: t.exposeString('avatarUrl', { nullable: true }),
    }),
  })

const UserStatistic = builder
  .objectRef<{
    total: number
    confirmed: number
    unconfirmed: number
    activated: number
    unactivated: number
  }>('UserStatistic')
  .implement({
    fields: (t) => ({
      total: t.exposeInt('total', { nullable: false }),
      confirmed: t.exposeInt('confirmed', { nullable: false }),
      unconfirmed: t.exposeInt('unconfirmed', { nullable: false }),
      activated: t.exposeInt('activated', { nullable: false }),
      unactivated: t.exposeInt('unactivated', { nullable: false }),
    }),
  })

const getUserFilter = (filter?: string, statusFilter?: string) => {
  let whereCondition = {}
  const containsFilter = { contains: filter, mode: 'insensitive' }
  if (filter && filter !== '*') {
    whereCondition = {
      OR: [
        { username: { ...containsFilter } },
        { name: { ...containsFilter } },
        { email: { ...containsFilter } },
        { given_name: { ...containsFilter } },
        { family_name: { ...containsFilter } },
        {
          profile: {
            OR: [{ business: { ...containsFilter } }, { position: { ...containsFilter } }],
          },
        },
      ],
    }
  }
  if (statusFilter && statusFilter !== 'all') {
    switch (statusFilter) {
      case 'confirmed':
        whereCondition = {
          ...whereCondition,
          profile: {
            confirmationDate: {
              not: null,
            },
          },
        }
        break
      case 'unconfirmed':
        whereCondition = {
          AND: [
            { ...whereCondition },
            {
              OR: [
                { profile: null },
                {
                  profile: {
                    confirmationDate: null,
                  },
                },
              ],
            },
          ],
        }
        break
      case 'activated':
        whereCondition = {
          ...whereCondition,
          profile: {
            activationDate: {
              not: null,
            },
          },
        }
        break
      case 'unactivated':
        whereCondition = {
          AND: [
            { ...whereCondition },
            {
              OR: [
                { profile: null },
                {
                  profile: {
                    activationDate: null,
                  },
                },
              ],
            },
          ],
        }
        break
      default:
        throw new Error(`Unknown status filter: ${statusFilter}`)
    }
  }
  return whereCondition
}

const ManagedUsersResponse = builder
  .objectRef<{ skip: number; take: number; filter?: string; statusFilter?: string }>('ManagedUsersResponse')
  .implement({
    fields: (t) => ({
      skip: t.exposeInt('skip', { nullable: false }),
      take: t.exposeInt('take', { nullable: false }),
      filter: t.exposeString('filter', { nullable: true }),
      statusFilter: t.exposeString('statusFilter', { nullable: true }),
      userStatistics: t.withAuth({ isLoggedIn: true }).field({
        type: UserStatistic,
        nullable: false,
        resolve: async (source, _args, context) => {
          if (!context.session.user.isAdmin) {
            throw new Error('Unauthorized: Only admins can access managed users count')
          }

          // Total with all filters applied (for pagination only)
          const total = await prisma.user.count({
            where: getUserFilter(source.filter, source.statusFilter),
          })

          // Always calculate GLOBAL stats (no filters) for consistent reference
          const [globalConfirmed, globalActivated, absoluteTotal] = await Promise.all([
            prisma.user.count({
              where: { profile: { confirmationDate: { not: null } } },
            }),
            prisma.user.count({
              where: { profile: { activationDate: { not: null } } },
            }),
            prisma.user.count(), // Total users in database
          ])

          return {
            total, // Filtered total for pagination
            confirmed: globalConfirmed, // Global confirmed count
            unconfirmed: absoluteTotal - globalConfirmed, // Global unconfirmed count
            activated: globalActivated, // Global activated count
            unactivated: absoluteTotal - globalActivated, // Global unactivated count
          }
        },
      }),
      users: t.withAuth({ isLoggedIn: true }).field({
        type: [ManagedUser],
        nullable: { list: false, items: false },
        resolve: async (source, _args, context) => {
          if (!context.session.user.isAdmin) {
            throw new Error('Unauthorized: Only admins can access managed users')
          }
          const users = await prisma.user.findMany({
            include: {
              profile: true,
            },
            where: { ...getUserFilter(source.filter, source.statusFilter) },

            skip: source.skip,
            take: source.take,
            orderBy: {
              createdAt: 'desc',
            },
          })
          return users.map((user) => ({
            id: user.id,
            username: user.username,
            email: user.email,
            name: user.name,
            given_name: user.given_name,
            family_name: user.family_name,
            isAdmin: user.isAdmin,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            registered: !!user.profile,
            business: user.profile?.business || null,
            position: user.profile?.position || null,
            confirmationDate: user.profile?.confirmationDate || null,
            activationDate: user.profile?.activationDate || null,
            avatarUrl: user.avatarUrl,
          }))
        },
      }),
    }),
  })

builder.queryField('managedUsers', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ManagedUsersResponse,
    nullable: false,
    args: {
      skip: t.arg.int({ defaultValue: 0 }),
      take: t.arg.int({ defaultValue: 100 }),
      filter: t.arg.string({ required: false }),
      statusFilter: t.arg.string({ required: false }),
    },
    resolve: async (_source, args, context) => {
      if (!context.session.user.isAdmin) {
        throw new Error('Unauthorized: Only admins can access managed users')
      }
      return {
        skip: args.skip,
        take: args.take,
        filter: args.filter || undefined,
        statusFilter: args.statusFilter || undefined,
      }
    },
  }),
)

builder.mutationField('toggleAdminStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'User',
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { userId }, context) => {
      if (!context.session.user.isAdmin) {
        throw new Error('Unauthorized: Only admins can toggle admin status')
      }
      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })
      return await prisma.user.update({
        where: { id: user.id },
        data: {
          isAdmin: !user.isAdmin,
        },
        ...query,
      })
    },
  }),
)

builder.mutationField('ensureUserProfile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'UserProfile',
    args: {
      userId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { userId }, context) => {
      if (!context.session.user.isAdmin) {
        throw new Error('Unauthorized: Only admins can access managed users count')
      }

      const existingProfile = await prisma.userProfile.findUnique({
        where: { userId },
      })

      if (existingProfile) {
        return existingProfile
      }

      const user = await prisma.user.findUniqueOrThrow({
        where: { id: userId },
      })

      return await prisma.userProfile.create({
        data: {
          userId: user.id,
          freeMessages: 20,
          freeStorage: 100000,
          email: user.email,
          firstName: user.given_name || '',
          lastName: user.family_name || '',
        },
      })
    },
  }),
)
