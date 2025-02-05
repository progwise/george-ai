import { dropFile, embedFile } from '@george-ai/langchain-chat'
import { builder } from '../builder'
import { prisma } from '../../prisma'
import { getFilePath } from '../../file-upload'
import * as fs from 'fs'

console.log('Setting up: AiKnowledgeSourceFile')

export const AiKnowledgeSourceFile = builder.prismaObject(
  'AiKnowledgeSourceFile',
  {
    name: 'AiKnowledgeSourceFile',
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
      aiKnowledgeSourceId: t.exposeString('aiKnowledgeSourceId', {
        nullable: false,
      }),
    }),
  },
)

export const AiKnowledgeSourceFileInput = builder.inputType(
  'AiKnowledgeSourceFileInput',
  {
    fields: (t) => ({
      name: t.string({ required: true }),
      originUri: t.string({ required: true }),
      mimeType: t.string({ required: true }),
      // content: t.string({ required: true }),
      aiKnowledgeSourceId: t.string({ required: true }),
    }),
  },
)

builder.mutationField('prepareFile', (t) =>
  t.prismaField({
    type: 'AiKnowledgeSourceFile',
    args: {
      data: t.arg({ type: AiKnowledgeSourceFileInput, required: true }),
    },
    resolve: async (query, _source, { data }) => {
      const knowledgeSource = await prisma.aiKnowledgeSource.findUnique({
        where: { id: data.aiKnowledgeSourceId },
      })
      if (!knowledgeSource) {
        throw new Error(
          `Knowledge source not found: ${data.aiKnowledgeSourceId}`,
        )
      }
      return await prisma.aiKnowledgeSourceFile.create({
        ...query,
        data,
      })
    },
  }),
)

builder.mutationField('processFile', (t) =>
  t.prismaField({
    type: 'AiKnowledgeSourceFile',
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { fileId }) => {
      const file = await prisma.aiKnowledgeSourceFile.findUnique({
        ...query,
        where: { id: fileId },
      })
      if (!file) {
        throw new Error(`File not found: ${fileId}`)
      }

      const embeddedFile = await embedFile(file.aiKnowledgeSourceId, {
        id: file.id,
        name: file.name,
        originUri: file.originUri!,
        mimeType: file.mimeType,
        path: getFilePath(file.id),
      })

      return await prisma.aiKnowledgeSourceFile.update({
        ...query,
        where: { id: fileId },
        data: {
          ...embeddedFile,
          processedAt: new Date(),
        },
      })

      return file
    },
  }),
)

builder.queryField('aiKnowledgeSourceFiles', (t) =>
  t.prismaField({
    type: ['AiKnowledgeSourceFile'],
    args: {
      knowledgeSourceId: t.arg.string({ required: true }),
    },
    resolve: (query, _source, { knowledgeSourceId }) => {
      return prisma.aiKnowledgeSourceFile.findMany({
        where: { aiKnowledgeSourceId: knowledgeSourceId },
      })
    },
  }),
)

builder.mutationField('dropFile', (t) =>
  t.prismaField({
    type: 'AiKnowledgeSourceFile',
    args: {
      fileId: t.arg.string({ required: true }),
    },
    resolve: async (query, _source, { fileId }) => {
      const file = await prisma.aiKnowledgeSourceFile.findUnique({
        ...query,
        where: { id: fileId },
      })
      if (!file) {
        throw new Error(`File not found: ${fileId}`)
      }

      await dropFile(file.aiKnowledgeSourceId, file.id)

      const deleteResult = await prisma.aiKnowledgeSourceFile.delete({
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
