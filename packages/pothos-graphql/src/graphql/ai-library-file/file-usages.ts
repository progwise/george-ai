import { ExtractionMethod, getExtractionMethod } from '@george-ai/app-commons'
import { prisma } from '@george-ai/app-database'
import { canReadWorkspaceOrThrow } from '@george-ai/app-domain'
import { vectorStore } from '@george-ai/vector-store'

import { builder } from '../builder'

console.log('Setting up: AiLibraryFile FileUsages')

interface FileUsageType {
  id: string
  fileId: string
  extractionMethod?: ExtractionMethod
  libraryId: string
  listId: string
  listName: string
  itemName: string
  fragment: number | null
}

const FileUsage = builder.objectRef<FileUsageType>('FileUsage').implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    listId: t.exposeString('listId', { nullable: false }),
    listName: t.exposeString('listName', { nullable: false }),
    itemName: t.exposeString('itemName', { nullable: false }),
    fragment: t.exposeInt('fragment', { nullable: true }),
    extractionMethod: t.expose('extractionMethod', { type: 'ExtractionMethod', nullable: true }),
    fileId: t.exposeString('fileId', { nullable: false }),
    libraryId: t.exposeString('libraryId', { nullable: false }),
    chunkCount: t.withAuth({ isLoggedIn: true }).field({
      type: 'Int',
      nullable: false,
      resolve: async ({ libraryId, fileId, fragment }, _args, { workspaceId }) => {
        const count = await vectorStore.getChunkCount({ workspaceId, libraryId, fileId, fragment }) // getFileChunkCount(libraryId, fileId, fragment || undefined)
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
      libraryId: t.arg.string({ required: true }),
      fileId: t.arg.string({ required: true }),
      skip: t.arg.int({ required: true }),
      take: t.arg.int({ required: true }),
    },
    resolve: async (_source, { libraryId, fileId, skip, take }, { workspaceId, session }) => {
      // Authorization check
      await canReadWorkspaceOrThrow(workspaceId, session.user.id)

      const file = await prisma.aiLibraryFile.findFirstOrThrow({
        where: { id: fileId, libraryId },
      })
      // Query list items with pagination
      const [count, items] = await prisma.$transaction([
        prisma.aiListItem.count({
          where: { fileId: fileId },
        }),
        prisma.aiListItem.findMany({
          where: { fileId: fileId },
          include: {
            list: { select: { id: true, name: true } },
          },
          skip,
          take,
          orderBy: { file: { createdAt: 'desc' } },
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
          fileId: item.fileId,
          libraryId: file.libraryId,
          listId: item.listId,
          listName: item.list.name,
          itemName: item.itemName,
          fragment: item.fragment,
          extractionMethod: getExtractionMethod(item.extractionMethod),
        })),
      }
    },
  }),
)
