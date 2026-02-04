import { createHash } from 'node:crypto'
import { createReadStream } from 'node:fs'
import path from 'node:path'

import { SOURCE_FILE_NAME } from './commons'

export async function getSourceHash(filePath: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash('sha256')
    const stream = createReadStream(path.join(filePath, SOURCE_FILE_NAME))

    stream.on('data', (data) => {
      hash.update(data)
    })

    stream.on('end', () => {
      resolve(hash.digest('hex'))
    })

    stream.on('error', (err) => {
      reject(err)
    })
  })
}
