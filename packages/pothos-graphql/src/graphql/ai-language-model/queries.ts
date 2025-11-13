import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLanguageModel Queries')

builder.queryField('aiLanguageModels', (t) =>
  t.prismaField({
    type: ['AiLanguageModel'],
    nullable: false,
    args: {
      canDoEmbedding: t.arg.boolean({ required: false }),
      canDoChatCompletion: t.arg.boolean({ required: false }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.aiLanguageModel.findMany({
        ...query,
        where: {
          enabled: true,
          deleted: false,
          ...(args.canDoEmbedding !== undefined &&
            args.canDoEmbedding !== null && { canDoEmbedding: args.canDoEmbedding }),
          ...(args.canDoChatCompletion !== undefined &&
            args.canDoChatCompletion !== null && { canDoChatCompletion: args.canDoChatCompletion }),
        },
        orderBy: [{ provider: 'asc' }, { name: 'asc' }],
      })
    },
  }),
)
