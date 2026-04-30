import { Readable } from 'node:stream'

import * as standard from './standard-splitter'

export async function* splitMarkdownStream(parameters: {
  splitType: 'standard' | 'langchain'
  markdownStream: Readable
  options?: { maxCharsPerSection?: number; splitSectionOverlapLines?: number }
}): AsyncGenerator<string, void, unknown> {
  const { splitType, markdownStream, options } = parameters

  switch (splitType) {
    case 'standard':
      return yield* standard.splitMarkdownStream(markdownStream, options)
    case 'langchain':
      throw new Error('Langchain split type is not implemented yet')
    default:
  }
}
