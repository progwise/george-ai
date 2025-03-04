import { dropVectorStore } from '@george-ai/langchain-chat'
import * as fs from 'fs'
import { getFilePath } from '../../file-upload'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibrary')

export enum AiLibraryType {
  GOOGLE_DRIVE = 'GOOGLE_DRIVE',
  POCKETBASE = 'POCKETBASE',
}

export const AiLibraryTypeEnum = builder.enumType(AiLibraryType, {
  name: 'AiLibraryType',
  description: 'Type of the AiLibrary',
})

export const AiLibrary = builder.prismaObject('AiLibrary', {
  name: 'AiLibrary',
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    description: t.exposeString('description'),
    url: t.exposeString('url'),
    libraryType: t.field({
      type: AiLibraryTypeEnum,
      nullable: false,
      select: { libraryType: true },
      resolve: (aiLibrary) => {
        return AiLibraryType[aiLibrary.libraryType]
      },
    }),
    owner: t.relation('owner'),
    ownerId: t.exposeString('ownerId', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
    files: t.relation('files'),
  }),
})

const AiLibraryInput = builder.inputType('AiLibraryInput', {
  fields: (t) => ({
    name: t.string({ required: true }),
    description: t.string({ required: false }),
    url: t.string({ required: false }),
    icon: t.string({ required: false }),
    libraryType: t.field({
      type: AiLibraryTypeEnum,
      required: true,
    }),
  }),
})

builder.queryField('aiLibrary', (t) =>
  t.prismaField({
    type: 'AiLibrary',
    args: {
      id: t.arg.string(),
    },
    resolve: (query, _source, { id }) => {
      return prisma.aiLibrary.findUnique({
        ...query,
        where: { id },
      })
    },
  }),
)

builder.queryField('aiLibraries', (t) =>
  t.prismaField({
    type: ['AiLibrary'],
    args: {
      ownerId: t.arg.string(),
    },
    resolve: (query, _source, { ownerId }) => {
      return prisma.aiLibrary.findMany({
        ...query,
        where: { ownerId },
      })
    },
  }),
)

builder.mutationField('updateAiLibrary', (t) =>
  t.prismaField({
    type: 'AiLibrary',
    args: {
      id: t.arg.string({ required: true }),
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: async (query, _source, { id, data }) => {
      return prisma.aiLibrary.update({
        ...query,
        where: { id },
        data,
      })
    },
  }),
)

builder.mutationField('createAiLibrary', (t) =>
  t.prismaField({
    type: 'AiLibrary',
    args: {
      ownerId: t.arg.string(),
      data: t.arg({ type: AiLibraryInput, required: true }),
    },
    resolve: (query, _source, { ownerId, data }) => {
      return prisma.aiLibrary.create({
        ...query,
        data: {
          ...data,
          ownerId,
        },
      })
    },
  }),
)

builder.mutationField('deleteAiLibrary', (t) =>
  t.prismaField({
    type: 'AiLibrary',
    args: {
      id: t.arg.string({ required: true }),
    },
    resolve: (query, _source, { id }) => {
      return prisma.aiLibrary.delete({
        ...query,
        where: { id },
      })
    },
  }),
)

builder.mutationField('clearEmbeddedFiles', (t) =>
  t.field({
    type: 'Boolean',
    args: {
      libraryId: t.arg.string({ required: true }),
    },
    resolve: async (_parent, { libraryId }) => {
      await dropVectorStore(libraryId)
      const files = await prisma.aiLibraryFile.findMany({
        select: { id: true },
        where: { libraryId },
      })
      await prisma.aiLibraryFile.deleteMany({
        where: { libraryId },
      })

      const deleteFilePromises = files.map((file) => {
        const filePath = getFilePath(file.id)
        return new Promise((resolve) => {
          fs.rm(filePath, (err) => {
            if (err) {
              resolve(`Error deleting file: ${filePath}: ${err.message}`)
            }
            resolve(`Deleted file: ${filePath}`)
          })
        })
      })
      await Promise.all(deleteFilePromises)
      return true
    },
  }),
)
