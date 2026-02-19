import { createWriteStream } from 'node:fs'
import { Readable } from 'node:stream'

import { existsFile } from './exists-file'
import { renameFile } from './rename-file'

export async function writeFile(filePath: string, stream: Readable): Promise<void> {
  const exists = await existsFile(filePath)
  if (exists) {
    await renameFile(filePath, `${filePath}-${Date.now()}.bak`)
  }

  const writeStream = createWriteStream(filePath)
  return new Promise((resolve, reject) => {
    stream.pipe(writeStream)
    writeStream.on('finish', resolve)
    writeStream.on('error', reject)
  })
}
