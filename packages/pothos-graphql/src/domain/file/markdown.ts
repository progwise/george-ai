import fs from 'fs'

import { getFileDir } from '@george-ai/file-management'

import { prisma } from '../../prisma'

export const getLatestExtractionMarkdownFileName = async ({
  fileId,
  libraryId,
}: {
  fileId: string
  libraryId: string
}) => {
  const extractionTask = await prisma.aiFileContentExtractionTask.findFirst({
    where: { fileId, extractionFinishedAt: { not: null } },
    orderBy: { extractionFinishedAt: 'desc' },
  })

  if (extractionTask) {
    if (!extractionTask.markdownFileName) {
      throw new Error('The uploaded file is missing but extraction task was found.')
    }
    return extractionTask.markdownFileName
  }

  const fileDir = getFileDir({ fileId, libraryId })
  const allFiles = await fs.promises.readdir(fileDir)
  const allMarkdownFiles = allFiles
    .filter((file) => file.endsWith('.md') && file.startsWith('converted'))
    .sort((a, b) => b.localeCompare(a))
    .reverse()
  if (allMarkdownFiles.length === 0) {
    return null
  }
  return allMarkdownFiles[0]
}

export const getLegacyExtractionFileCount = async ({ fileId, libraryId }: { fileId: string; libraryId: string }) => {
  const fileNames = await getLegacyExtractionFileNames({ fileId, libraryId })
  return fileNames.length
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
