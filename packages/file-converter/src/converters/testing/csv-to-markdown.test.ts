import { resolve } from 'path'
import { describe, expect, it, vi } from 'vitest'

import { saveMarkdownContent } from '@george-ai/file-management'

import { transformCsvToMarkdown } from '../csv-to-markdown'

vi.mock('@george-ai/file-management', () => ({
  deleteExistingExtraction: vi.fn(),
  getFileDir: vi.fn(() => '/mock/dir'),
  saveMarkdownContent: vi.fn(),
}))

describe('csvToMarkdownConverter', () => {
  const abortSignal = new AbortController().signal

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should convert basic csv to markdown', async () => {
    const csvPath = resolve(__dirname, 'test.csv')

    const basicExtraction = await transformCsvToMarkdown(csvPath, abortSignal, 'test-lib', 'test-file', 'test.csv')

    // confirm total parts and header
    expect(basicExtraction.metadata?.rowCount).toBe(2)
    expect(basicExtraction.metadata?.headers).toEqual(['Name', 'Age', 'City', ''])

    const firstPart = vi.mocked(saveMarkdownContent).mock.calls[0][0]
    expect(firstPart.part).toBe(1)
    expect(firstPart.markdown).toMatch(/# CSV Row 1/)
    expect(firstPart.markdown).toContain('**Name:**')
    expect(firstPart.markdown).toContain('```\nGeorge AI\n```')
    expect(firstPart.markdown).toContain('**Age:**')
    expect(firstPart.markdown).toContain('```\n30\n```')
    expect(firstPart.markdown).toContain('**City:**')
    expect(firstPart.markdown).toContain('```\nGreifswald\n```')

    const secondPart = vi.mocked(saveMarkdownContent).mock.calls[1][0]
    expect(secondPart.part).toBe(2)
    expect(secondPart.markdown).toMatch(/# CSV Row 2/)
    expect(secondPart.markdown).toContain('**Name:**')
    expect(secondPart.markdown).toContain('```\nBob\n```')
    expect(secondPart.markdown).toContain('**Age:**')
    expect(secondPart.markdown).toContain('```\n55\n```')
    expect(secondPart.markdown).toContain('**City:**')
    expect(secondPart.markdown).toContain('```\nCologne\n```')
  }, 10000)

  it('should convert csv containing html to markdown', async () => {
    const csvPath = resolve(__dirname, 'testHtml.csv')

    const htmlExtraction = await transformCsvToMarkdown(csvPath, abortSignal, 'test-lib', 'test-file', 'testHtml.csv')

    expect(htmlExtraction.metadata?.rowCount).toBe(2)
    expect(htmlExtraction.metadata?.headers).toEqual(['Name', 'Age', 'City', ''])

    const firstPart = vi.mocked(saveMarkdownContent).mock.calls[0][0]
    expect(firstPart.part).toBe(1)
    expect(firstPart.markdown).toMatch(/# CSV Row 1/)
    expect(firstPart.markdown).toContain('**Name:**')
    expect(firstPart.markdown).toContain('```\n<a>George AI</a>\n```')
    expect(firstPart.markdown).toContain('**Age:**')
    expect(firstPart.markdown).toContain('```\n30\n```')
    expect(firstPart.markdown).toContain('**City:**')
    expect(firstPart.markdown).toContain('```\n<body> Greifswald </body>\n```')

    const secondPart = vi.mocked(saveMarkdownContent).mock.calls[1][0]
    expect(secondPart.part).toBe(2)
    expect(secondPart.markdown).toMatch(/# CSV Row 2/)
    expect(secondPart.markdown).toContain('**Name:**')
    expect(secondPart.markdown).toContain('```\nBob\n```')
    expect(secondPart.markdown).toContain('**Age:**')
    expect(secondPart.markdown).toContain('```\n<br> 55 </br>\n```')
    expect(secondPart.markdown).toContain('**City:**')
    expect(secondPart.markdown).toContain('```\n<p>Cologne</p>\n```')
  }, 10000)
})
