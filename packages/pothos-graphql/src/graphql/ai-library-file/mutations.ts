import { prisma } from '@george-ai/app-domain'

import { canAccessLibraryOrThrow, deleteFile } from '../../domain'
import { canAccessFileOrThrow, dropAllLibraryFiles } from '../../domain/file'
import { dropOutdatedMarkdowns } from '../../domain/file/markdown'
import { builder } from '../builder'

console.log('Setting up: AiLibraryFile Mutations')

const AiLibraryFileInput = builder.inputType('AiLibraryFileInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    originUri: t.string({ required: true }),
    mimeType: t.string({ required: true }),
    libraryId: t.string({ required: true }),
    size: t.int({ required: true }),
    originModificationDate: t.field({ type: 'DateTime', required: true }),
  }),
})

builder.mutationField('prepareFileUpload', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    args: {
      data: t.arg({ type: AiLibraryFileInput, required: true }),
    },
    nullable: false,
    resolve: async (query, _source, { data }, context) => {
      await canAccessLibraryOrThrow(data.libraryId, context.session.user.id)
      return await prisma.aiLibraryFile.create({
        ...query,
        data,
      })
    },
  }),
)

builder.mutationField('deleteLibraryFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, _parent, { fileId }, context) => {
      return await deleteFile(fileId, context.session.user.id)
    },
  }),
)

builder.mutationField('deleteLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      fileIds: t.arg.idList({ required: true }),
    },
    resolve: async (_source, { fileIds }, context) => {
      const results = await Promise.all(fileIds.map((fileId) => deleteFile(fileId, context.session.user.id)))
      return results.length
    },
  }),
)

builder.mutationField('dropAllLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId }, context) => {
      return await dropAllLibraryFiles(libraryId, context.session.user.id)
    },
  }),
)

builder.mutationField('cancelFileUpload', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { fileId }, context) => {
      await canAccessFileOrThrow(fileId, context.session.user.id)
      await deleteFile(fileId, context.session.user.id)
      return true
    },
  }),
)

builder.mutationField('dropOutdatedMarkdowns', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { fileId }, context) => {
      // Check permissions
      const file = await canAccessFileOrThrow(fileId, context.session.user.id)

      const droppedCount = await dropOutdatedMarkdowns({ fileId, libraryId: file.libraryId })

      return droppedCount
    },
  }),
)
