import { MarkdownTextSplitter } from '@langchain/textsplitters'
import { createInterface } from 'node:readline'
import { Readable } from 'stream'

export async function* splitMarkdownStream(
  markdownStream: Readable,
  options: { chunkSize: number; chunkOverlap: number },
) {
  const { chunkSize, chunkOverlap } = options
  const splitter = new MarkdownTextSplitter({
    chunkSize,
    chunkOverlap,
  })

  const rl = createInterface({
    input: markdownStream,
    crlfDelay: Infinity,
  })

  let buffer = ''
  const BUFFER_THRESHOLD = chunkSize * 5 // Process in 5KB-ish chunks

  for await (const line of rl) {
    buffer += line + '\n'

    // When the buffer is large enough, split it
    if (buffer.length >= BUFFER_THRESHOLD) {
      const chunks = await splitter.splitText(buffer)

      // Yield all but the last chunk
      // (The last chunk might be cut off, so we keep it for the next iteration)
      const lastChunk = chunks.pop()
      for (const chunk of chunks) {
        yield chunk
      }
      buffer = lastChunk || ''
    }
  }

  // Handle remaining text
  if (buffer.trim()) {
    const finalChunks = await splitter.splitText(buffer)
    for (const chunk of finalChunks) {
      yield chunk
    }
  }
}

export async function splitMarkdownText(markdown: string, options: { chunkSize?: number; chunkOverlap: number }) {
  const { chunkSize, chunkOverlap } = options
  const splitter = new MarkdownTextSplitter({
    chunkSize,
    chunkOverlap,
  })

  const chunks = await splitter.splitText(markdown)

  return chunks
}
