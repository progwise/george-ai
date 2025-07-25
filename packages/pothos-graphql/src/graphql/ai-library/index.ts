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
    embeddingId: t.exposeString('embeddingId'),
    embedding: t.relation('embedding', {}),
    participants: t.prismaField({
      type: ['User'],
      nullable: false,
      select: { participants: { select: { user: true } } },
      resolve: (_query, library) => {
        return library.participants.map((participant) => participant.user)
      },
    }),
  }),
})

const AiEmbeddingInput = builder.inputType('AiEmbeddingInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    model: t.string({ required: true }),
    provider: t.string({ required: true }),
    url: t.string({ required: false }),
    headers: t.string({ required: false }),
    options: t.string({ required: false }),
  }),
})

const AiLibraryInput = builder.inputType('AiLibraryInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    embedding: t.field({ type: AiEmbeddingInput, required: false }),
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

      const { embedding, ...libraryData } = data

      console.log(`Updating library: ${library.name} with data:`, JSON.stringify(libraryData, null, 2))

      return prisma.aiLibrary.update({
        ...query,
        where: { id },
        data: {
          ...libraryData,
          ...(embedding && {
            embedding: {
              upsert: {
                create: embedding,
                update: embedding,
              },
            },
          }),
        },
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
      const { embedding, ...libraryData } = data

      return prisma.aiLibrary.create({
        ...query,
        data: {
          ...libraryData,
          ownerId: userId,
          participants: {
            create: [{ userId }],
          },
          ...(embedding && {
            embedding: {
              create: embedding,
            },
          }),
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
