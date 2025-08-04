import './process-file'

import { getUnprocessedFiles } from './process-unprocessed-files'

export const processingQueue: Record<string, string[]> = {}

// Adding new files to queue, prevent overlapping parallel runs
export const addToQueue = (libraryId: string, fileIds: string[]) => {
  const existing = processingQueue[libraryId] || []
  processingQueue[libraryId] = Array.from(new Set([...existing, ...fileIds]))
}

// remove single Id from queue
export const removeIdFromQueue = (libraryId: string, fileIds: string[]) => {
  processingQueue[libraryId] = (processingQueue[libraryId] || []).filter((id) => !fileIds.includes(id))
}

// cleanup processed Ids and Ids which do not exist anymore (example: dropped files while processing)
export const cleanUpQueue = async (libraryId: string) => {
  const stillUnprocessedIds = (await getUnprocessedFiles(libraryId)).map((file) => file.id)
  processingQueue[libraryId] = (processingQueue[libraryId] || []).filter((id) => stillUnprocessedIds.includes(id))
}

// filters out files currently in process (queue) from all unprocessed files === newFiles
export const checkNewFilesToProcess = async (libraryId: string) => {
  const previousFileIds = processingQueue[libraryId] ?? []
  const currentUnprocessedFiles = await getUnprocessedFiles(libraryId)
  const newFiles = currentUnprocessedFiles.filter((file) => !previousFileIds.includes(file.id))
  return newFiles
}
