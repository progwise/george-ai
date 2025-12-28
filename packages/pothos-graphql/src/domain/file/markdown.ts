import fs from 'fs'

import { prisma } from '@george-ai/app-domain'
import { getFileDir } from '@george-ai/file-management'

export const getLatestExtractionMarkdownFileNames = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}) => {
  const latestExtractionTask = await prisma.aiContentProcessingTask.findFirst({
    select: { extractionSubTasks: true },
    where: {
      fileId,
      extractionFinishedAt: { not: null },
      extractionSubTasks: { some: { markdownFileName: { not: null } } },
    },
    orderBy: { extractionFinishedAt: 'desc' },
  })

  if (latestExtractionTask) {
    return latestExtractionTask.extractionSubTasks
      .map((subTask) => subTask.markdownFileName)
      .filter((name): name is string => !!name)
      .sort((a, b) => a.localeCompare(b)) // Non-null assertion as we filtered above
  }

  const fileDir = getFileDir({ fileId, libraryId })
  const allFiles = await fs.promises.readdir(fileDir)
  const allMarkdownFiles = allFiles
    .filter((file) => file.endsWith('.md') && file.startsWith('converted'))
    .sort((a, b) => b.localeCompare(a))
    .reverse()
  if (allMarkdownFiles.length === 0) {
    return []
  }
  return [allMarkdownFiles[0]]
}

export const getExistingExtractionMarkdownFileNames = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}) => {
  const markdownFileNamesFromTasks = await prisma.aiContentProcessingTask.findMany({
    select: { extractionSubTasks: true },
    where: {
      fileId: fileId,
      extractionFinishedAt: { not: null },
      extractionSubTasks: { some: { markdownFileName: { not: null } } },
    },
    orderBy: { extractionFinishedAt: 'desc' },
  })

  const fileDir = getFileDir({ fileId, libraryId })
  const allFiles = await fs.promises.readdir(fileDir)
  const allMarkdownFiles = allFiles.filter((file) => file.endsWith('.md'))
  // Filter only existing markdown files from tasks
  const existingMarkdownFilesFromTasks = await markdownFileNamesFromTasks
    .flatMap((task) => task.extractionSubTasks.map((st) => st.markdownFileName))
    .filter((name): name is string => !!name)
    .filter((name) => !!name && allMarkdownFiles.includes(name)) // Non-null assertion as we filtered above

  const legacyFileNames = allMarkdownFiles.filter((file) => file.startsWith('converted') && file.endsWith('.md'))

  const resultSet = new Set([...existingMarkdownFilesFromTasks, ...legacyFileNames])
  return [...resultSet].sort((a, b) => a.localeCompare(b))
}

export const getLegacyExtractionFileCount = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileNames = await getLegacyExtractionFileNames({ fileId, libraryId })
  return fileNames.length
}

export const getLatestLegacyExtractionFileName = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}) => {
  const fileNames = await getLegacyExtractionFileNames({ fileId, libraryId })
  if (fileNames.length === 0) {
    return []
  }
  return fileNames[fileNames.length - 1]
}

export const getLegacyExtractionFileNames = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileDir = getFileDir({ fileId, libraryId })
  const allFiles = await fs.promises.readdir(fileDir)
  const allMarkdownFiles = allFiles
    .filter((file) => file.endsWith('.md') && file.startsWith('converted'))
    .sort((a, b) => b.localeCompare(a))
    .reverse()
  return allMarkdownFiles
}

export const dropOutdatedMarkdowns = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const latestFileNames = await getLatestExtractionMarkdownFileNames({ fileId, libraryId })
  const allFileNames = await getExistingExtractionMarkdownFileNames({ fileId, libraryId })

  const fileDir = getFileDir({ fileId, libraryId })

  const filesToDelete = allFileNames.filter((name) => !latestFileNames.includes(name))

  await Promise.all(
    filesToDelete.map(async (fileName) => {
      const filePath = `${fileDir}/${fileName}`
      try {
        await fs.promises.unlink(filePath)
      } catch (err) {
        console.error(`Failed to delete file ${filePath}:`, err)
      }
    }),
  )

  return filesToDelete.length
}
