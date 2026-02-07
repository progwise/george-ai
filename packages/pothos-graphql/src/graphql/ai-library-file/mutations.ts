import { GraphQLError } from 'graphql/error'

import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'
import { workspace } from '@george-ai/app-domain'

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
  t.withAuth({ isLoggedIn: true }).field({
    type: 'FileInfo',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId, fileId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      const file = await workspace.getFileInfo(workspaceId, { libraryId, fileId })
      if (!file) {
        throw new GraphQLError('File not found')
      }
      await workspace.deleteFiles(workspaceId, { libraryId, fileIds: [fileId] })
      return file
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
    resolve: async (_source, { libraryId, fileIds }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      return await workspace.deleteFiles(workspaceId, { libraryId, fileIds })
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
    resolve: async (_source, { libraryId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      return await workspace.deleteFiles(workspaceId, { libraryId })
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
    resolve: async (_source, { libraryId, fileId }, { workspaceId, session }) => {
      await canWriteWorkspaceOrThrow(workspaceId, session.user.id)
      await workspace.deleteFiles(workspaceId, { libraryId, fileIds: [fileId] })
      return true
    },
  }),
)
