import { prisma } from '@george-ai/app-domain'

import { builder } from '../builder'

console.log('Setting up: AiAssistant queries')

builder.queryField('aiAssistant', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiAssistant',
    args: {
      assistantId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { assistantId }, context) => {
      // Any workspace member can access assistants in their workspace
      const assistant = await prisma.aiAssistant.findUnique({
        ...query,
        where: { id: assistantId, workspaceId: context.workspaceId },
      })
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
      // Any workspace member can access all assistants in the workspace
      return prisma.aiAssistant.findMany({
        ...query,
        where: {
          workspaceId: context.workspaceId,
        },
      })
    },
  }),
)
