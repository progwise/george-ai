import * as fs from 'fs'

import { dropFileFromVectorstore, embedFile } from '@george-ai/langchain-chat'

import { getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibraryFile')

async function dropFileById(fileId: string) {
  const file = await prisma.aiLibraryFile.findUnique({
    where: { id: fileId },
  })
  if (!file) {
    throw new Error(`File not found: ${fileId}`)
  }

  const deleteResult = await Promise.all([
    dropFileFromVectorstore(file.libraryId, file.id),
    new Promise((resolve, reject) => {
      fs.rm(getFilePath(file.id), (err) => {
        if (err) {
          reject(`Error deleting file ${file.id}: ${err.message}`)
        } else {
          resolve(`File ${file.id} deleted`)
        }
      })
    }),
  ]).then(async () => {
    const deletedFile = await prisma.aiLibraryFile.delete({
      where: { id: file.id },
    })
    console.log('dropped file', deletedFile)
    return deletedFile
  })

  return deleteResult
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
        },
      })
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
    resolve: async (_query, _source, { fileId }) => {
      return await dropFileById(fileId)
    },
  }),
)

builder.mutationField('dropFiles', (t) =>
  t.prismaField({
    type: ['AiLibraryFile'],
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { libraryId }) => {
      const files = await prisma.aiLibraryFile.findMany({
        ...query,
        where: { libraryId },
      })

      if (files.length === 0) {
        throw new Error(`No files found for library: ${libraryId}`)
      }

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
