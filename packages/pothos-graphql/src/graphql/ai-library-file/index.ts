import { dropFile, embedFile } from '@george-ai/langchain-chat'
import { builder } from '../builder'
import { prisma } from '../../prisma'
import { getFilePath } from '../../file-upload'
import * as fs from 'fs'

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
    aiLibraryId: t.exposeString('aiLibraryId', {
      nullable: false,
    }),
  }),
})

export const AiLibraryFileInput = builder.inputType('AiLibraryFileInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    originUri: t.string({ required: true }),
    mimeType: t.string({ required: true }),
    aiLibraryId: t.string({ required: true }),
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
        where: { id: data.aiLibraryId },
      })
      if (!library) {
        throw new Error(`Library not found: ${data.aiLibraryId}`)
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

      const embeddedFile = await embedFile(file.aiLibraryId, {
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
        },
      })
    },
  }),
)

builder.queryField('aiLibraryFiles', (t) =>
  t.prismaField({
    type: ['AiLibraryFile'],
    args: {
      aiLibraryId: t.arg.string({ required: true }),
    },
    resolve: (query, _source, { aiLibraryId }) => {
      return prisma.aiLibraryFile.findMany({
        where: { aiLibraryId },
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

      await dropFile(file.aiLibraryId, file.id)

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
