import { readFileSync } from 'fs'

import { getTestAssetLocalPath } from './test-files'

export async function getTestImage(fileName: string) {
  const filePath = await getTestAssetLocalPath(fileName)

  try {
    const buffer = readFileSync(filePath)
    const base64 = buffer.toString('base64')
    return base64
  } catch (error) {
    throw new Error(`Failed to load test image ${filePath}: ${error}`)
  }
}

export function getInvalidImage(): string {
  // This is a malformed PNG that should cause an error
  return 'iVBORw0KGgoAAAANSUhEUgAAAAIAAAACCAYAAABytg0kAAAAFklEQVQIHWP8//8/AzYwiqHBgA0OAABCWgEHw8oWBQAAAABJRU5ErkJggg=='
}
