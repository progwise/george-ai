import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibraryCrawler')

builder.prismaObject('AiLibraryCrawler', {
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    url: t.exposeString('url', { nullable: false }),
    lastRun: t.expose('lastRun', { type: 'DateTime' }),
    maxDepth: t.exposeInt('maxDepth', { nullable: false }),
    maxPages: t.exposeInt('maxPages', { nullable: false }),

    createdAt: t.expose('createdAt', {
      type: 'DateTime',
      nullable: false,
    }),
    updatedAt: t.expose('updatedAt', {
      type: 'DateTime',
      nullable: false,
    }),
  }),
})

builder.mutationField('createAiLibraryCrawler', (t) =>
  t.prismaField({
    type: 'AiLibraryCrawler',
    args: {
      url: t.arg.string(),
      maxDepth: t.arg.int(),
      maxPages: t.arg.int(),
      libraryId: t.arg.string(),
    },
    resolve: (query, _source, args) => {
      return prisma.aiLibraryCrawler.create({
        ...query,
        data: args,
      })
    },
  }),
)
