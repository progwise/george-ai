import { prisma } from '../../prisma'
import { builder } from '../builder'

import './queryFiles'
import './queries'
import './mutations'

console.log('Setting up: AiLibrary')

builder.prismaObject('AiLibrary', {
  name: 'AiLibrary',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    url: t.exposeString('url'),
    owner: t.relation('owner', { nullable: false }),
    ownerId: t.exposeString('ownerId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    filesCount: t.int({
      nullable: false,
      resolve: async (parent) => {
        const count = await prisma.aiLibraryFile.count({
          where: { libraryId: parent.id },
        })
        return count
      },
    }),
    crawlers: t.relation('crawlers', { nullable: false }),
    embeddingModelName: t.exposeString('embeddingModelName'),
    fileConverterOptions: t.exposeString('fileConverterOptions'),
    users: t.prismaField({
      type: ['User'],
      nullable: false,
      select: { participants: { select: { user: true } } },
      resolve: (_query, library) => {
        const users = library.participants.map((participant) => participant.user)
        // Sort participants: owner first, then other users
        return users.sort((a, b) => {
          if (a.id === library.ownerId) return -1
          if (b.id === library.ownerId) return 1
          return 0
        })
      },
    }),
  }),
})
