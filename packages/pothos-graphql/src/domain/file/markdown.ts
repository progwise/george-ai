import fs from 'fs'

import { getFileDir } from '@george-ai/file-management'

import { prisma } from '../../prisma'

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
