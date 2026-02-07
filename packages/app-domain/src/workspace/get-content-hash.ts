import { createHash } from 'node:crypto'

export async function getContentHash(parameters: { content: string | Buffer }) {
  const { content } = parameters

  const hash = createHash('sha256').update(content).digest('hex')

  return hash
}
