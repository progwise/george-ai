import { prisma } from '@george-ai/app-database'

export const recordOmittedFile = async ({
  libraryId,
  crawlerRunId,
  filePath,
  fileName,
  fileSize,
  reason,
  filterType,
  filterValue,
}: {
  libraryId: string
  crawlerRunId?: string
  filePath: string
  fileName: string
  fileSize?: number | string
  reason: string
  filterType: string
  filterValue?: string
}) => {
  // Check if the file already exists in the database
  const existingFile = await prisma.aiLibraryFile.findFirst({
    where: {
      libraryId,
      originUri: filePath,
      archivedAt: null, // Only consider non-archived files
    },
  })

  // If the file exists, mark it as archived
  if (existingFile) {
    await prisma.aiLibraryFile.update({
      where: { id: existingFile.id },
      data: { archivedAt: new Date() },
    })
  }

  await prisma.aiLibraryUpdate.create({
    data: {
      libraryId,
      crawlerRunId,
      fileId: existingFile?.id || null,
      message: reason,
      updateType: 'omitted',
      filePath,
      fileName,
      fileSize: typeof fileSize === 'string' ? parseInt(fileSize, 10) : fileSize,
      filterType,
      filterValue,
    },
  })
}
