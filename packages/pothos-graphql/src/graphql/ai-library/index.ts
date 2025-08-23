import * as fs from 'fs'

import { dropVectorStore } from '@george-ai/langchain-chat'

import { prisma } from '../../prisma'
import { builder } from '../builder'

import './queryFiles'

import { getLibraryDir } from '@george-ai/file-management'

import { canAccessLibraryOrThrow } from './check-participation'

console.log('Setting up: AiLibrary')

export const AiLibrary = builder.prismaObject('AiLibrary', {
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
    files: t.relation('files', { nullable: false }),
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

const AiLibraryInput = builder.inputType('AiLibraryInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    embeddingModelName: t.string({ required: false }),
    fileConverterOptions: t.string({ required: false }),
  }),
})

builder.queryField('aiLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      libraryId: t.arg.string(),
    },
    nullable: false,
    resolve: async (query, _source, { libraryId }, context) => {
      const library = await prisma.aiLibrary.findUniqueOrThrow({
        ...query,
        where: { id: libraryId },
      })
      await canAccessLibraryOrThrow(context, libraryId)
      return library
    },
  }),
)

builder.queryField('aiLibraries', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: ['AiLibrary'],
    nullable: false,
    resolve: (query, _source, _args, context) => {
      return prisma.aiLibrary.findMany({
        ...query,
        where: { participants: { some: { userId: context.session.user.id } } },
      })
    },
  }),
)

builder.mutationField('updateAiLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      const library = await prisma.aiLibrary.findUnique({
        where: { id },
      })
      if (!library) {
        throw new Error(`Library with id ${id} not found`)
      }
      canAccessLibraryOrThrow(context, id)

      return prisma.aiLibrary.update({
        ...query,
        where: { id },
        data,
      })
    },
  }),
)

builder.mutationField('createAiLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: (query, _source, { data }, context) => {
      const userId = context.session.user.id

      return prisma.aiLibrary.create({
        ...query,
        data: {
          ...data,
          ownerId: userId,
          participants: {
            create: [{ userId }],
          },
        },
      })
    },
  }),
)

builder.mutationField('deleteAiLibrary', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: async (_source, { id }) => {
      await prisma.$transaction(
        [
          prisma.aiLibraryCrawler.deleteMany({ where: { libraryId: id } }),
          prisma.aiLibrary.delete({
            where: { id },
          }),
        ],
        {},
      )
      return true
    },
  }),
)

builder.mutationField('clearEmbeddedFiles', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId }) => {
      await dropVectorStore(libraryId)
      await prisma.aiLibraryFile.deleteMany({
        where: { libraryId },
      })

      const libraryPath = getLibraryDir(libraryId)
      if (fs.existsSync(libraryPath)) {
        await fs.promises.rm(libraryPath, { recursive: true, force: true })
      }
      return true
    },
  }),
)
