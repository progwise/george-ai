import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { prisma } from '../../../../app-database/src'
import { deleteFile, dropAllLibraryFiles } from '../../domain'
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
      await canWriteWorkspaceOrThrow(context.workspaceId, context.session.user.id)
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
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, _parent, { libraryId, fileId }, context) => {
      const workspaceId = context.workspaceId
      await canWriteWorkspaceOrThrow(workspaceId, context.session.user.id)
      return await deleteFile({ workspaceId, libraryId, fileId })
    },
  }),
)

builder.mutationField('deleteLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Int',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileIds: t.arg.idList({ required: true }),
    },
    resolve: async (_source, { libraryId, fileIds }, context) => {
      const workspaceId = context.workspaceId
      await canWriteWorkspaceOrThrow(workspaceId, context.session.user.id)
      const results = await Promise.all(fileIds.map((fileId) => deleteFile({ workspaceId, libraryId, fileId })))
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
      const workspaceId = context.workspaceId
      await canWriteWorkspaceOrThrow(workspaceId, context.session.user.id)
      return await dropAllLibraryFiles({ workspaceId, libraryId })
    },
  }),
)

builder.mutationField('cancelFileUpload', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId, fileId }, context) => {
      const workspaceId = context.workspaceId
      await canWriteWorkspaceOrThrow(workspaceId, context.session.user.id)
      await deleteFile({ workspaceId, libraryId, fileId })
      return true
    },
  }),
)
