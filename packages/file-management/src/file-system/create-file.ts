import { WriteStream, createWriteStream } from 'node:fs'
import { rm } from 'node:fs/promises'

import { logger } from './commons'
import { stashFile } from './stash-file'

export async function createFile(filePath: string): Promise<{ writeStream: WriteStream }> {
  const stash = await stashFile(filePath)

  const writeFileStream = createWriteStream(filePath)

  writeFileStream.on('close', async () => {
    logger.debug(`File ${filePath} has been saved`)
    await stash.drop()
  })

  writeFileStream.on('error', async (error) => {
    console.error(`Error writing file ${filePath}:`, error)
    await rm(filePath, { force: true })
    stash.pop()
  })

  return {
    writeStream: writeFileStream,
  }
}
