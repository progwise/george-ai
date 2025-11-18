import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiAssistant queries')

builder.queryField('aiAssistant', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAssistant',
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { assistantId }, context) => {
      const user = context.session.user
      const assistant = await prisma.aiAssistant.findUnique({
        ...query,
        where: { id: assistantId },
        include: { participants: { include: { user: true } } },
      })
      if (!assistant) return null

      const isAuthorized =
        user.isAdmin ||
        assistant.ownerId === user.id ||
        (await prisma.aiAssistantParticipant.findFirst({ where: { assistantId, userId: user.id } })) != null

      if (!isAuthorized) return null
      return assistant
    },
  }),
)

builder.queryField('aiAssistants', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiAssistant'],
    nullable: {
      list: false,
      items: false,
    },
    resolve: (query, _source, _args, context) => {
      return prisma.aiAssistant.findMany({
        ...query,
        where: {
          workspaceId: context.workspaceId,
          OR: [{ ownerId: context.session.user.id }, { participants: { some: { userId: context.session.user.id } } }],
        },
      })
    },
  }),
)
