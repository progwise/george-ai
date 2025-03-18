import * as fs from 'fs'

import { dropFile, embedFile } from '@george-ai/langchain-chat'

import { getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibraryFile')

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

builder.queryField('aiLibraryFiles', (t) =>
  t.prismaField({
    type: ['AiLibraryFile'],
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: (_query, _source, { libraryId }) => {
      return prisma.aiLibraryFile.findMany({
        where: { libraryId },
      })
    },
  }),
)

builder.mutationField('dropFile', (t) =>
  t.prismaField({
    type: 'AiLibraryFile',
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

      await dropFile(file.libraryId, file.id)

      const deleteResult = await prisma.aiLibraryFile.delete({
        where: { id: fileId },
      })

      await new Promise((resolve) => {
        fs.rm(getFilePath(file.id), (err) => {
          if (err) {
            resolve(`Error deleting file ${file.id}: ${err.message}`)
          } else {
            resolve(`File ${file.id} deleted`)
          }
        })
      })

      console.log('dropped file', deleteResult)

      return file
    },
  }),
)
