import { prisma } from '@george-ai/app-database'
import { library } from '@george-ai/file-management'
import { vectorStore } from '@george-ai/vector-store'

export async function clearDocuments(workspaceId: string, params: { libraryId: string }): Promise<number> {
  const { resultDb } = await prisma.$transaction(async (tx) => {
    const resultDb = await tx.aiLibraryFile.deleteMany({
      where: {
        libraryId: params.libraryId,
        library: {
          workspaceId,
        },
      },
    })

    const resultFs = await library.clearDocuments(workspaceId, params)

    const resultVectorStore = await vectorStore.removeChunks({ workspaceId, libraryId: params.libraryId })

    return { resultDb, resultFs, resultVectorStore }
  })
  return resultDb.count
}
