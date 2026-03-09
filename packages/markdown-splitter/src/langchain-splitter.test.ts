import { fail } from 'assert'
import { Readable } from 'stream'

import { splitMarkdownStream, splitMarkdownText } from './langchain-splitter'

describe('Testing the langchain splitter', () => {
  const markdownUrls = [
    'https://raw.githubusercontent.com/nodejs/node/main/README.md',
    'https://raw.githubusercontent.com/KaTeX/KaTeX/main/README.md',
  ]

  it.each(markdownUrls)('Should chunk %s with streaming approach', async (url) => {
    const response = await fetch(url, {
      method: 'GET',
    })

    expect(response.ok).toBeDefined()

    if (!response.body) {
      fail('body is not defined')
    }

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const markdownStream = Readable.fromWeb(response.body)

    const splitChunks: string[] = []
    for await (const splitChunk of splitMarkdownStream(markdownStream, { chunkOverlap: 100, chunkSize: 1000 })) {
      splitChunks.push(splitChunk)
    }

    expect(splitChunks.length).toBeGreaterThan(10)
  })

  it.each(markdownUrls)('Should chunk %s with direct string approach', async (url) => {
    const response = await fetch(url, {
      method: 'GET',
    })

    expect(response.ok).toBeDefined()

    if (!response.body) {
      fail('body is not defined')
    }

    const responseText = await response.text()

    const splitChunks = await splitMarkdownText(responseText, { chunkOverlap: 200, chunkSize: 2000 })

    expect(splitChunks.length).toBeGreaterThan(5)
  })
})
