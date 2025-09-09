import * as fs from 'fs'

import { validateFileConverterOptionsString } from '@george-ai/file-converter'
import { getLibraryDir } from '@george-ai/file-management'
import { dropVectorStore } from '@george-ai/langchain-chat'

import { canAccessLibraryOrThrow } from '../../domain'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibrary Mutations')

const AiLibraryInput = builder.inputType('AiLibraryInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    embeddingModelName: t.string({ required: false }),
    fileConverterOptions: t.string({ required: false }),
    embeddingTimeoutMs: t.int({ required: false }),
  }),
})

builder.mutationField('updateLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      const library = await prisma.aiLibrary.findUniqueOrThrow({
        where: { id },
      })
      await canAccessLibraryOrThrow(library.id, context.session.user.id)

      // Validate fileConverterOptions if provided
      const validatedData = {
        ...data,
        fileConverterOptions: validateFileConverterOptionsString(data.fileConverterOptions),
      }

      return prisma.aiLibrary.update({
        ...query,
        where: { id },
        data: validatedData,
      })
    },
  }),
)

builder.mutationField('createLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    args: {
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: (query, _source, { data }, context) => {
      const userId = context.session.user.id

      // Validate fileConverterOptions if provided
      const validatedData = {
        ...data,
        fileConverterOptions: validateFileConverterOptionsString(data.fileConverterOptions),
      }

      return prisma.aiLibrary.create({
        ...query,
        data: {
          ...validatedData,
          ownerId: userId,
          participants: {
            create: [{ userId }],
          },
        },
      })
    },
  }),
)

builder.mutationField('deleteLibrary', (t) =>
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
