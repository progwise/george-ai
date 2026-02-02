import { Readable } from 'node:stream'

import { workspaceStorage } from '.'
import { FileManifest } from '../schemas'

describe.sequential('Read and write extractions', () => {
  const TEST_WORKSPACE_ID = `test-workspace-extraction_${Date.now()}`
  const TEST_LIBRARY_ID = 'test-library'
  const TEST_FILE_ID = 'test-file'
  const TEST_SOURCE_CONTENT = 'This is the content of the source file.'
  let TEST_FILE_MANIFEST: FileManifest

  beforeAll(async () => {
    await workspaceStorage.createWorkspace(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await workspaceStorage.createLibrary(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    TEST_FILE_MANIFEST = await workspaceStorage.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      stream: Readable.from([TEST_SOURCE_CONTENT]),
      meta: {
        originalName: 'test-file.txt',
        originalUpdatedAt: new Date().toISOString(),
        mimeType: 'text/plain',
        originalContentHash: 'abc',
      },
    })
  })

  afterAll(async () => {
    await workspaceStorage.deleteWorkspace(TEST_WORKSPACE_ID)
  })

  it('should write am simple extraction file', async () => {
    const extractionContent = 'This is the content of the extraction file.'
    const writer = await workspaceStorage.createExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'textExtraction',
    })

    writer.write(extractionContent)

    const extractionWriteResult = await writer.finish()

    expect(extractionWriteResult).toBeDefined()
  })

  it('should read a simple extraction file', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'textExtraction',
    })
    expect(extractionReadStream).toBeDefined()

    const chunks: Buffer[] = []
    for await (const chunk of extractionReadStream!) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }
    const extractedContent = Buffer.concat(chunks).toString('utf-8')
    expect(extractedContent).toBe('This is the content of the extraction file.')
  })

  it('Should get extraction manifest', async () => {
    const extractionManifest = await workspaceStorage.getExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'textExtraction',
    })
    expect(extractionManifest).toBeDefined()
    expect(extractionManifest!.extractionFiles).toBe(1)
    expect(extractionManifest!.physicalFiles).toBe(2)
    expect(extractionManifest!.extractionMethod).toBe('textExtraction')
    expect(extractionManifest!.sourceHash).toBe(TEST_FILE_MANIFEST.sourceHash)
  })

  it('Should have updated library usage after adding an extraction file', async () => {
    const libraryManifest = await workspaceStorage.getLibrary(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
    })
    expect(libraryManifest).toBeDefined()
    expect(libraryManifest!.usage.sourceFiles).toBe(1)
    expect(libraryManifest!.usage.extractions).toBe(1)
    expect(libraryManifest!.usage.physicalFiles).toBe(3)
  })

  it('Should add a fragmented extraction', async () => {
    // Realistic markdown document - splits on h1 and h2 headlines
    const markdownContent = `# Product Documentation

Welcome to our product documentation. This intro section stays with the title.

## Installation

To install the product, run:

\`\`\`bash
npm install @company/product
\`\`\`

### Prerequisites

Make sure you have Node.js 18+ installed. Note that ### does NOT trigger a split.

## Configuration

Configure the product by creating a \`config.json\` file:

\`\`\`json
{
  "## this is not a headline": "just JSON content",
  "apiKey": "your-key"
}
\`\`\`

## Usage

Import and use the product:

\`\`\`typescript
import { Product } from '@company/product'
const p = new Product()
\`\`\`

# Advanced Topics

This is a new h1 section, which also triggers a split.

## Troubleshooting

If you encounter issues, check the logs.
`
    const writer = await workspaceStorage.createExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'csvExtraction',
      splitFragmentPattern: '^#{1,2} ',
    })

    writer.write(markdownContent)

    const extractionManifest = await writer.finish()

    expect(extractionManifest).toBeDefined()
    // Expected fragments:
    // 1: "# Product Documentation\n\n...intro..."
    // 2: "## Installation\n\n...including ### Prerequisites..."
    // 3: "## Configuration\n\n..."
    // 4: "## Usage\n\n..."
    // 5: "# Advanced Topics\n\n..."
    // 6: "## Troubleshooting\n\n..."
    expect(extractionManifest.extractionFiles).toBe(6)
    expect(extractionManifest.physicalFiles).toBe(8) // 6 fragments + output.md + metadata.json
  })

  it('Should read fragmented extraction stream', async () => {
    const extractionReadStream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      extractionMethod: 'csvExtraction',
    })
    expect(extractionReadStream).toBeDefined()

    const fragments: string[] = []
    const currentFragmentLines: string[] = []
    for await (const chunk of extractionReadStream!) {
      if (chunk.startsWith('--- Fragment:')) {
        // New fragment marker
        if (currentFragmentLines.length > 0) {
          fragments.push(currentFragmentLines.join('\n'))
          currentFragmentLines.length = 0
        }
      } else {
        currentFragmentLines.push(chunk)
      }
    }
    // Push last fragment
    if (currentFragmentLines.length > 0) {
      const chunk = currentFragmentLines.join('\n')
      fragments.push(chunk)
    }

    expect(fragments.length).toBe(6)
    console.log('Extracted Fragments:', fragments)
    const extractedContent = fragments.join('\n---\n')
    console.log('Full Extracted Content:\n', extractedContent)
    expect(extractedContent).toBeDefined()
    expect(extractedContent.length).toBeGreaterThan(0)
    expect(extractedContent).toContain('# Product Documentation')
    expect(extractedContent).toContain('## Installation')
    expect(extractedContent).toContain('### Prerequisites')
    expect(extractedContent).toContain('## Configuration')
    expect(extractedContent).toContain('## Usage')
    expect(extractedContent).toContain('# Advanced Topics')
    expect(extractedContent).toContain('## Troubleshooting')
  })

  it('should throw when requesting fragment on non-fragmented extraction', async () => {
    await expect(
      workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        fileId: TEST_FILE_ID,
        extractionMethod: 'textExtraction',
        fragment: 0,
      }),
    ).rejects.toThrow('Fragments are not available')
  })

  it('should throw when reading non-existent extraction', async () => {
    await expect(
      workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
        libraryId: TEST_LIBRARY_ID,
        fileId: TEST_FILE_ID,
        // @ts-expect-error Testing non-existent extraction method
        extractionMethod: 'non-existent-method',
      }),
    ).rejects.toThrow()
  })

  it('should combine all extractions when no method specified', async () => {
    const stream = await workspaceStorage.readExtraction(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      fileId: TEST_FILE_ID,
      // No extractionMethod - should combine both text-extraction and fragmented-extraction
    })

    const lines: string[] = []
    for await (const line of stream) {
      lines.push(line)
    }

    const content = lines.join('\n')

    // Should have separators for each extraction method
    const separatorCount = lines.filter((line) => line === '--- Extraction Start ---').length
    expect(separatorCount).toBe(2) // text-extraction + fragmented-extraction

    // Should contain content from both extractions
    expect(content).toContain('This is the content of the extraction file') // from text-extraction
    expect(content).toContain('# Product Documentation') // from fragmented-extraction
  })
})
