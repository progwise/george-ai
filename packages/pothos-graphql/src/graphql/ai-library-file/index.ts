import { deleteFile } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'
import { selectRecursively } from './google-drive-fetch'

import './process-file'
import './read-file'
import './file-chunks'

const GoogleDriveFile = builder
  .objectRef<{
    id: string
    kind: string
    name: string
    mimeType: string
  }>('GoogleDriveFile')
  .implement({
    description: 'Google Drive Files Fetch Query',
    fields: (t) => ({
      id: t.exposeString('id', { nullable: false }),
      kind: t.exposeString('kind', { nullable: false }),
      name: t.exposeString('name', { nullable: false }),
      mimeType: t.exposeString('mimeType', { nullable: false }),
    }),
  })

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
    await deleteFile(file.id, file.libraryId)
    return file
  } catch (error) {
    dropError = error instanceof Error ? error.message : String(error)
    console.error(`Error dropping file ${fileId}:`, dropError)
    try {
      // goes possibly wrong if file record was already deleted above
      await prisma.aiLibraryFile.update({
        where: { id: file.id },
        data: { dropError },
      })
    } catch (updateError) {
      console.error(`Error updating file drop error for ${fileId}:`, updateError)
    }
    return { ...file, dropError }
  }
}

export const AiLibraryFile = builder.prismaObject('AiLibraryFile', {
  name: 'AiLibraryFile',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    name: t.exposeString('name', { nullable: false }),
    originUri: t.exposeString('originUri', { nullable: true }),
    docPath: t.exposeString('docPath', { nullable: true }),
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

builder.queryField('aiLibraryFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_query, _parent, { libraryId, fileId }) => {
      // TODO: Check access rights
      const file = await prisma.aiLibraryFile.findFirstOrThrow({ where: { libraryId, id: fileId } })
      return file
    },
  }),
)

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
      return results
    },
  }),
)

builder.mutationField('cancelFileUpload', (t) =>
  t.field({
    type: 'Boolean',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId, libraryId }) => {
      await deleteFile(fileId, libraryId)
      return true
    },
  }),
)

builder.mutationField('selectFilesFromGoogleDriveFolders', (t) =>
  t.field({
    type: [GoogleDriveFile],
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      accessToken: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId, accessToken }) => {
      const checkedFiles = await selectRecursively(fileId, accessToken)
      const googleDriveFiles = checkedFiles.map((file) => ({
        id: file.id,
        kind: file.kind,
        name: file.name,
        mimeType: file.kind,
      }))
      return googleDriveFiles
    },
  }),
)
