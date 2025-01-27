import { dropFile, embedFiles } from '@george-ai/langchain-chat'
import { builder } from '../builder'
import { prisma } from '../prisma'

console.log('Setting up: AiKnowledgeSourceFile')

function base64toBlob(base64Data: string, contentType: string) {
  const sliceSize = 1024
  const byteCharacters = atob(base64Data)
  const bytesLength = byteCharacters.length
  const slicesCount = Math.ceil(bytesLength / sliceSize)
  const byteArrays = new Array<Uint8Array>(slicesCount)

  for (let sliceIndex = 0; sliceIndex < slicesCount; ++sliceIndex) {
    const begin = sliceIndex * sliceSize
    const end = Math.min(begin + sliceSize, bytesLength)

    const bytes = new Array(end - begin)
    for (let offset = begin, i = 0; offset < end; ++i, ++offset) {
      bytes[i] = byteCharacters[offset].charCodeAt(0)
    }
    byteArrays[sliceIndex] = new Uint8Array(bytes)
  }
  return new Blob(byteArrays, { type: contentType })
}

export const AiKnowledgeSourceFile = builder.prismaObject(
  'AiKnowledgeSourceFile',
  {
    name: 'AiKnowledgeSourceFile',
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
      updatedAt: t.expose('updatedAt', { type: 'DateTime' }),
      name: t.exposeString('name', { nullable: false }),
      url: t.exposeString('url', { nullable: false }),
      mimeType: t.exposeString('mimeType', { nullable: false }),
      size: t.exposeInt('size', { nullable: false }),
      chunks: t.exposeInt('chunks', { nullable: false }),
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
      url: t.string({ required: true }),
      mimeType: t.string({ required: true }),
      content: t.string({ required: true }),
      aiKnowledgeSourceId: t.string({ required: true }),
    }),
  },
)

builder.mutationField('embedFile', (t) =>
  t.prismaField({
    type: 'AiKnowledgeSourceFile',
    args: {
      data: t.arg({ type: AiKnowledgeSourceFileInput, required: true }),
    },
    resolve: async (query, _source, { data }) => {
      const contentBlob = base64toBlob(data.content, data.mimeType)
      const dbContent = await prisma.aiKnowledgeSourceFile.create({
        ...query,
        data: {
          mimeType: data.mimeType,
          size: contentBlob.size,
          name: data.name,
          aiKnowledgeSourceId: data.aiKnowledgeSourceId,
          url: data.url,
        },
      })

      const loadedFiles = await embedFiles(data.aiKnowledgeSourceId, [
        {
          id: dbContent.id,
          name: data.name,
          url: data.url,
          mimeType: data.mimeType,
          content: contentBlob,
        },
      ])

      const dbContent2 = await prisma.aiKnowledgeSourceFile.update({
        ...query,
        where: { id: dbContent.id },
        data: { chunks: loadedFiles[0].content.length },
      })

      return dbContent2
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

      console.log('dropped file', deleteResult)

      return file
    },
  }),
)
