import { canAccessLibraryOrThrow, deleteFile, deleteLibraryFiles } from '../../domain'
import { canAccessFileOrThrow } from '../../domain/file'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibraryFile Mutations')

const AiLibraryFileInput = builder.inputType('AiLibraryFileInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    originUri: t.string({ required: true }),
    mimeType: t.string({ required: true }),
    libraryId: t.string({ required: true }),
  }),
})

builder.mutationField('prepareFile', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibraryFile',
    args: {
      data: t.arg({ type: AiLibraryFileInput, required: true }),
    },
    resolve: async (query, _source, { data }, context) => {
      await canAccessLibraryOrThrow(data.libraryId, context.session.user.id)
      return await prisma.aiLibraryFile.create({
        ...query,
        data,
      })
    },
  }),
)

builder.mutationField('deleteFile', (t) =>
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

builder.mutationField('deleteFiles', (t) =>
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

builder.mutationField('deleteLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId }, context) => {
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)
      return await deleteLibraryFiles(libraryId, context.session.user.id)
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
