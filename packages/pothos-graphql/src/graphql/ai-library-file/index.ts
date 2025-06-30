import { embedFile } from '@george-ai/langchain-chat'

import { cleanupFile, deleteFileAndRecord, getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'
import { processFile } from './process-file'

console.log('Setting up: AiLibraryFile')

async function dropFileById(fileId: string) {
  const file = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  if (!file) {
    throw new Error(`File not found: ${fileId}`)
  }

  let dropError: string | null = null

  try {
    await deleteFileAndRecord(file.id, file.libraryId)
    return file
  } catch (error) {
    dropError = error instanceof Error ? error.message : String(error)
    const updatedFile = await prisma.aiLibraryFile.update({
      where: { id: file.id },
      data: { dropError },
    })
    return updatedFile
  }
}

const cancelFileUpload = async (fileId: string) => {
  await cleanupFile(fileId)
}

export const AiLibraryFile = builder.prismaObject('AiLibraryFile', {
  name: 'AiLibraryFile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    name: t.exposeString('name', { nullable: false }),
    originUri: t.exposeString('originUri', { nullable: true }),
    mimeType: t.exposeString('mimeType', { nullable: false }),
    size: t.exposeInt('size', { nullable: true }),
    chunks: t.exposeInt('chunks', { nullable: true }),
    uploadedAt: t.expose('uploadedAt', { type: 'DateTime', nullable: true }),
    processedAt: t.expose('processedAt', {
      type: 'DateTime',
      nullable: true,
    }),
    processingStartedAt: t.expose('processingStartedAt', { type: 'DateTime', nullable: true }),
    processingEndedAt: t.expose('processingEndedAt', { type: 'DateTime', nullable: true }),
    processingErrorAt: t.expose('processingErrorAt', { type: 'DateTime', nullable: true }),
    processingErrorMessage: t.exposeString('processingErrorMessage', { nullable: true }),
    libraryId: t.exposeString('libraryId', {
      nullable: false,
    }),
    dropError: t.exposeString('dropError', { nullable: true }),
  }),
})

export const AiLibraryFileInput = builder.inputType('AiLibraryFileInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    originUri: t.string({ required: true }),
    mimeType: t.string({ required: true }),
    libraryId: t.string({ required: true }),
  }),
})

builder.mutationField('prepareFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    args: {
      data: t.arg({ type: AiLibraryFileInput, required: true }),
    },
    resolve: async (query, _source, { data }) => {
      const library = await prisma.aiLibrary.findUnique({
        where: { id: data.libraryId },
      })
      if (!library) {
        throw new Error(`Library not found: ${data.libraryId}`)
      }
      return await prisma.aiLibraryFile.create({
        ...query,
        data,
      })
    },
  }),
)

builder.mutationField('processFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { fileId }) => processFile(fileId),
  }),
)

const LibraryFileQueryResult = builder
  .objectRef<{ libraryId: string; take: number; skip: number }>('AiLibraryFileQueryResult')
  .implement({
    description: 'Query result for AI library files',
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      library: t.withAuth({ isLoggedIn: true }).prismaField({
        type: 'AiLibrary',
        nullable: false,
        resolve: async (query, root, _args, context) => {
          const libraryUsers = await prisma.aiLibrary.findFirstOrThrow({
            where: { id: root.libraryId },
            select: { ownerId: true, participants: { select: { userId: true } } },
          })
          if (
            libraryUsers.ownerId !== context.session.user.id &&
            !libraryUsers.participants.some((participant) => participant.userId === context.session.user.id)
          ) {
            throw new Error('You do not have access to this library')
          }
          return prisma.aiLibrary.findUniqueOrThrow({ where: { id: root.libraryId } })
        },
      }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      count: t.withAuth({ isLoggedIn: true }).field({
        type: 'Int',
        nullable: false,
        resolve: async (root, _args, context) => {
          const libraryUsers = await prisma.aiLibrary.findFirstOrThrow({
            where: { id: root.libraryId },
            select: { ownerId: true, participants: { select: { userId: true } } },
          })
          if (
            libraryUsers.ownerId !== context.session.user.id &&
            !libraryUsers.participants.some((participant) => participant.userId === context.session.user.id)
          ) {
            throw new Error('You do not have access to this library')
          }
          console.log('Counting AI library files for library:', root.libraryId)
          return prisma.aiLibraryFile.count({
            where: { libraryId: root.libraryId },
          })
        },
      }),
      files: t.withAuth({ isLoggedIn: true }).prismaField({
        type: ['AiLibraryFile'],
        nullable: false,
        resolve: async (query, root, args, context) => {
          const libraryUsers = await prisma.aiLibrary.findFirstOrThrow({
            where: { id: root.libraryId },
            select: { ownerId: true, participants: { select: { userId: true } } },
          })
          if (
            libraryUsers.ownerId !== context.session.user.id &&
            !libraryUsers.participants.some((participant) => participant.userId === context.session.user.id)
          ) {
            throw new Error('You do not have access to this library')
          }
          console.log('Fetching AI library files for library:', query)
          return prisma.aiLibraryFile.findMany({
            ...query,
            where: { libraryId: root.libraryId },
            orderBy: { createdAt: 'desc' },
            take: root.take ?? 10,
            skip: root.skip ?? 0,
          })
        },
      }),
    }),
  })

builder.queryField('aiLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: LibraryFileQueryResult,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      skip: t.arg.int({ required: true, defaultValue: 0 }),
      take: t.arg.int({ required: true, defaultValue: 20 }),
    },
    resolve: (_root, args) => {
      return {
        libraryId: args.libraryId,
        take: args.take ?? 10,
        skip: args.skip ?? 0,
      }
    },
  }),
)

builder.mutationField('dropFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _source, { fileId }) => {
      return await dropFileById(fileId)
    },
  }),
)

builder.mutationField('dropFiles', (t) =>
  t.prismaField({
    type: ['AiLibraryFile'],
    nullable: { list: false, items: false },
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { libraryId }) => {
      const files = await prisma.aiLibraryFile.findMany({
        ...query,
        where: { libraryId },
      })

      const results = []

      for (const file of files) {
        const droppedFile = await dropFileById(file.id)
        results.push(droppedFile)
      }

      console.log(`Dropped files for library ${libraryId}:`, results)

      return results
    },
  }),
)

builder.mutationField('reprocessFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { fileId }) => {
      const file = await prisma.aiLibraryFile.findUnique({
        ...query,
        where: { id: fileId },
      })
      if (!file) {
        throw new Error(`File not found: ${fileId}`)
      }

      await prisma.aiLibraryFile.update({
        where: { id: fileId },
        data: {
          processingStartedAt: new Date(),
        },
      })

      try {
        const embeddedFile = await embedFile(file.libraryId, {
          id: file.id,
          name: file.name,
          originUri: file.originUri!,
          mimeType: file.mimeType,
          path: getFilePath(file.id),
        })

        return await prisma.aiLibraryFile.update({
          ...query,
          where: { id: fileId },
          data: {
            ...embeddedFile,
            processedAt: new Date(),
            processingEndedAt: new Date(),
            processingErrorAt: null,
            processingErrorMessage: null,
          },
        })
      } catch (error) {
        await prisma.aiLibraryFile.update({
          where: { id: fileId },
          data: {
            processingErrorAt: new Date(),
            processingErrorMessage: (error as Error).message,
          },
        })
        throw error
      }
    },
  }),
)

builder.mutationField('cancelFileUpload', (t) =>
  t.field({
    type: 'Boolean',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId }) => {
      await cancelFileUpload(fileId)
      return true
    },
  }),
)
