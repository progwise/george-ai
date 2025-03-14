import { prisma } from '../../prisma'
import { builder } from '../builder'

builder.prismaObject('AiLanguageModel', {
  name: 'AiLanguageModel',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    provider: t.exposeString('provider'),
  }),
})

builder.queryField('aiLanguageModels', (t) =>
  t.prismaField({
    type: ['AiLanguageModel'],
    nullable: {
      list: false,
      items: false,
    },
    resolve: (query) => {
      return prisma.aiLanguageModel.findMany({
        ...query,
      })
    },
  }),
)
