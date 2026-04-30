import { createWriteStream } from 'node:fs'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { Readable } from 'node:stream'
import { pipeline } from 'node:stream/promises'

import { getFragmentsPath } from '../../entry/get-entry-path'
import { ExtractionIdentifier } from '../../schema'

/**
 * Write an fragment file stream to disk
 * Fragments are created even if no parent (Extraction) manifest exists.
 * Existing fragments are overwritten. Fragments directory of parent should be cleaned up before writing, so this should be safe.
 */
export async function writeFragment(
  identifier: ExtractionIdentifier,
  parameters: {
    fragment: number
    stream: Readable
  },
): Promise<{ size: number; fragment: number }> {
  const { fragment, stream } = parameters

  const fragmentsDir = getFragmentsPath(identifier)
  await mkdir(fragmentsDir, { recursive: true })
  const name = String(fragment).padStart(4, '0') + '.md'
  const fragmentFilePath = path.join(fragmentsDir, name)
  const writer = createWriteStream(fragmentFilePath)
  let size = 0

  await pipeline(
    stream,
    async function* (source) {
      for await (const chunk of source) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string)
        size += buf.length
        yield buf
      }
    },
    writer,
  )

  return { size, fragment }
}
