import { builder } from '../builder'
import { prisma } from '../prisma'

console.log('Setting up: AiKnowledgeSource')

export const AiKnowledgeSource = builder.prismaObject('AiKnowledgeSource', {
  name: 'AiKnowledgeSource',
  fields: (t) => ({
    id: t.exposeID('id'),
    name: t.exposeString('name'),
    url: t.exposeString('url'),
    createdAt: t.expose('createdAt', { type: 'DateTime' }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
  }),
})

builder.queryField('aiKnowledgeSource', (t) =>
  t.prismaField({
    type: 'AiKnowledgeSource',
    args: {
      id: t.arg.string(),
    },
    resolve: (query, _source, { id }) => {
      return prisma.aiKnowledgeSource.findUnique({
        ...query,
        where: { id },
      })
    },
  }),
)

builder.queryField('aiKnowledgeSourceList', (t) =>
  t.prismaField({
    type: ['AiKnowledgeSource'],
    args: {
      ownerId: t.arg.string(),
    },
    resolve: (query, _source, { ownerId }) => {
      return prisma.aiKnowledgeSource.findMany({
        ...query,
        where: { ownerId },
      })
    },
  }),
)
