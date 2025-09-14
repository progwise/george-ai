import { prisma } from '../../prisma'
import { builder } from '../builder'

import './queryFiles'
import './queries'
import './mutations'

console.log('Setting up: AiLibrary')

builder.prismaObject('AiLibraryParticipant', {
  name: 'AiLibraryParticipant',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    user: t.relation('user', { nullable: false }),
    userId: t.exposeString('userId', { nullable: false }),
    library: t.relation('library', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
  }),
})

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
    embeddingTimeoutMs: t.exposeInt('embeddingTimeoutMs'),
    fileConverterOptions: t.exposeString('fileConverterOptions'),
    participants: t.relation('participants', { nullable: false }),
  }),
})
