import { Readable } from 'stream'

import { ExtractionManifest } from '../../schema'

export interface ExtractionWriter {
  /** Write markdown content to output.md, backpressures if the stream buffer is full */
  write(chunk: string | Buffer): Promise<void>

  /** Queue a fragment stream - writes to numbered fragment files (0001.md, 0002.md, ...). returns the fragment number */
  addFragment(stream: Readable): number

  /** Queue an attachment stream - doesn't block, tracked internally */
  addAttachment(filename: string, stream: Readable, mimeType: string): void

  /** Finalize extraction - waits for all fragments and attachments to complete */
  ack(): Promise<ExtractionManifest>

  /** Abort and cleanup on error */
  nack(error?: Error): Promise<void>
}
