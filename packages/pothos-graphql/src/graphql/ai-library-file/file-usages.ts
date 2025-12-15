import { getFileChunkCount } from '@george-ai/langchain-chat'

import { canAccessFileOrThrow } from '../../domain/file'
import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLibraryFile FileUsages')

interface FileUsageType {
  id: string
  fileId: string
  libraryId: string
  listId: string
  listName: string
  itemName: string
  extractionIndex: number | null
  createdAt: Date
}

const FileUsage = builder.objectRef<FileUsageType>('FileUsage').implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    listName: t.exposeString('listName', { nullable: false }),
    itemName: t.exposeString('itemName', { nullable: false }),
    extractionIndex: t.exposeInt('extractionIndex', { nullable: true }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    chunkCount: t.field({
      type: 'Int',
      nullable: false,
      resolve: async ({ libraryId, fileId, extractionIndex }) => {
        const count = await getFileChunkCount(libraryId, fileId, extractionIndex || undefined)
        return count
      },
    }),
  }),
})

const FileUsageQueryResponse = builder
  .objectRef<{
    fileId: string
    fileName: string
    libraryId: string
    count: number
    skip: number
    take: number
    usages: FileUsageType[]
  }>('FileUsageQueryResponse')
  .implement({
    fields: (t) => ({
      fileId: t.exposeString('fileId', { nullable: false }),
      fileName: t.exposeString('fileName', { nullable: false }),
      libraryId: t.exposeString('libraryId', { nullable: false }),
      count: t.exposeInt('count', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      take: t.exposeInt('take', { nullable: false }),
      usages: t.field({
        type: [FileUsage],
        nullable: { items: false, list: false },
        resolve: async (parent) => {
          return parent.usages
        },
      }),
    }),
  })

builder.queryField('aiFileUsages', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: FileUsageQueryResponse,
    nullable: false,
    args: {
      fileId: t.arg.string({ required: true }),
      skip: t.arg.int({ required: true }),
      take: t.arg.int({ required: true }),
    },
    resolve: async (_source, { fileId, skip, take }, context) => {
      // Authorization check
      const file = await canAccessFileOrThrow(fileId, context.session.user.id)

      // Query list items with pagination
      const [count, items] = await prisma.$transaction([
        prisma.aiListItem.count({
          where: { sourceFileId: fileId },
        }),
        prisma.aiListItem.findMany({
          where: { sourceFileId: fileId },
          include: {
            list: { select: { id: true, name: true } },
          },
          skip,
          take,
          orderBy: { createdAt: 'desc' },
        }),
      ])

      // Map to response format
      return {
        fileId,
        fileName: file.name,
        libraryId: file.libraryId,
        count,
        skip,
        take,
        usages: items.map((item) => ({
          id: item.id,
          fileId: item.sourceFileId,
          libraryId: file.libraryId,
          listId: item.listId,
          listName: item.list.name,
          itemName: item.itemName,
          extractionIndex: item.extractionIndex,
          createdAt: item.createdAt,
        })),
      }
    },
  }),
)
