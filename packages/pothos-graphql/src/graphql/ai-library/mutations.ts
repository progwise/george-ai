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
    embeddingModelId: t.string({ required: false }),
    ocrModelId: t.string({ required: false }),
    fileConverterOptions: t.string({ required: false }),
    embeddingTimeoutMs: t.int({ required: false }),
    autoProcessCrawledFiles: t.boolean({ required: false }),
  }),
})

builder.mutationField('updateLibrary', (t) =>
  t.withAuth({ isLoggedIn: true }).prismaField({
    type: 'AiLibrary',
    nullable: false,
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: async (query, _source, { id, data }, context) => {
      await canAccessLibraryOrThrow(id, context.session.user.id)

      // Validate fileConverterOptions if provided
      const { embeddingModelId, ocrModelId, ...restData } = data

      return prisma.aiLibrary.update({
        ...query,
        where: { id },
        data: {
          name: restData.name,
          description: restData.description,
          url: restData.url,
          fileConverterOptions: validateFileConverterOptionsString(data.fileConverterOptions),
          embeddingTimeoutMs: restData.embeddingTimeoutMs,
          autoProcessCrawledFiles: data.autoProcessCrawledFiles ?? undefined,
          embeddingModelId: embeddingModelId ?? undefined,
          ocrModelId: ocrModelId ?? undefined,
        },
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
      const { embeddingModelId, ocrModelId, ...restData } = data

      return prisma.aiLibrary.create({
        ...query,
        data: {
          name: restData.name,
          description: restData.description,
          url: restData.url,
          fileConverterOptions: validateFileConverterOptionsString(data.fileConverterOptions),
          embeddingTimeoutMs: restData.embeddingTimeoutMs,
          autoProcessCrawledFiles: data.autoProcessCrawledFiles ?? undefined,
          ownerId: userId,
          workspaceId: context.workspaceId,
          embeddingModelId: embeddingModelId ?? undefined,
          ocrModelId: ocrModelId ?? undefined,
        },
      })
    },
  }),
)

builder.mutationField('deleteLibrary', (t) =>
  t.prismaField({
    type: 'AiLibrary',
    args: {
      id: t.arg.string({ required: true }),
    },
    nullable: false,
    resolve: async (query, _source, { id }) => {
      const result = await prisma.$transaction(
        [
          prisma.aiLibraryFile.deleteMany({ where: { libraryId: id } }),
          prisma.aiLibraryCrawler.deleteMany({ where: { libraryId: id } }),
          prisma.aiLibraryParticipant.deleteMany({ where: { libraryId: id } }),
          prisma.aiLibrary.delete({
            ...query,
            where: { id },
          }),
        ],
        {},
      )
      return result[3]
    },
  }),
)

const UpdateLibraryParticipantsResult = builder.simpleObject('UpdateLibraryParticipantsResult', {
  fields: (t) => ({
    addedParticipants: t.int({ nullable: false }),
    removedParticipants: t.int({ nullable: false }),
    totalParticipants: t.int({ nullable: false }),
  }),
})

builder.mutationField('updateLibraryParticipants', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: UpdateLibraryParticipantsResult,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      userIds: t.arg.stringList({ required: true }),
    },
    resolve: async (_source, { libraryId, userIds }, context) => {
      const library = await canAccessLibraryOrThrow(libraryId, context.session.user.id)
      if (library.ownerId !== context.session.user.id) {
        throw new Error('Only the owner can update participants')
      }
      const existingParticipants = await prisma.aiLibraryParticipant.findMany({
        where: { libraryId },
      })

      const newUserIds = userIds.filter(
        (userId) => !existingParticipants.some((participant) => participant.userId === userId),
      )

      const removedUserIds = existingParticipants
        .map((participant) => participant.userId)
        .filter((userId) => !userIds.includes(userId))

      const newParticipants = await prisma.aiLibraryParticipant.createMany({
        data: newUserIds.map((userId) => ({
          libraryId,
          userId,
        })),
      })

      const removedParticipants = await prisma.aiLibraryParticipant.deleteMany({
        where: {
          libraryId,
          userId: { in: removedUserIds },
        },
      })

      const totalParticipants = await prisma.aiLibraryParticipant.count({
        where: { libraryId },
      })

      return {
        addedParticipants: newParticipants.count,
        removedParticipants: removedParticipants.count,
        totalParticipants,
      }
    },
  }),
)

builder.mutationField('removeLibraryParticipant', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      participantId: t.arg.string({ required: true }),
    },
    resolve: async (_source, { libraryId, participantId }, context) => {
      const currentUserId = context.session.user.id
      const participant = await prisma.aiLibraryParticipant.findUniqueOrThrow({
        where: { id: participantId, libraryId },
        select: { libraryId: true, userId: true, library: { select: { ownerId: true } } },
      })

      const isOwner = participant.library.ownerId === currentUserId
      const isSelf = participant.userId === currentUserId

      if (!isOwner && !isSelf) {
        throw new Error('Only the owner can remove other participants')
      }

      await prisma.aiLibraryParticipant.delete({
        where: { id: participantId },
      })

      return true
    },
  }),
)

builder.mutationField('clearEmbeddedFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: 'Boolean',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId }, context) => {
      await canAccessLibraryOrThrow(libraryId, context.session.user.id)
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
