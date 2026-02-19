import { Readable } from 'node:stream'

import { createExtraction, readExtraction } from '.'
import { document as doc, library as lib, workspace as ws } from '..'
import { DocumentManifest } from '../schema'

describe.sequential('Create and read fragmented extractions', () => {
  const TEST_WORKSPACE_ID = `test-workspace-fragmented${Date.now()}`
  const TEST_LIBRARY_ID = 'test-fragmented-library'
  const TEST_FILE_ID = 'test-fragmented-file'
  const TEST_SOURCE_CONTENT = 'This is the content of the fragmented source file.'
  let TEST_DOCUMENT_MANIFEST: DocumentManifest

  beforeAll(async () => {
    await ws.create(TEST_WORKSPACE_ID, { name: 'Test Workspace' })
    await lib.create(TEST_WORKSPACE_ID, { libraryId: TEST_LIBRARY_ID, name: 'Test Library' })
    TEST_DOCUMENT_MANIFEST = await doc.create(TEST_WORKSPACE_ID, {
      documentId: TEST_FILE_ID,
      libraryId: TEST_LIBRARY_ID,
      name: 'test-fragmented-file.txt',
      mimeType: 'text/plain',
      uri: 'legacy://test-fragmented-file.txt',
      creator: 'Test Author',
      creationDate: new Date(),
      originHash: 'abc',
      lastModifiedDate: new Date(),
    })

    const { ack } = await doc.writeSource(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
      stream: Readable.from([TEST_SOURCE_CONTENT]),
    })
    await ack()
  })

  afterAll(async () => {
    //await ws.delete(TEST_WORKSPACE_ID)
  })

  it('Should add fragments to an extraction', async () => {
    const document = await doc.get(TEST_WORKSPACE_ID, {
      libraryId: TEST_LIBRARY_ID,
      documentId: TEST_FILE_ID,
    })
    expect(document).toBeDefined()
    const writer = await createExtraction(document, 'csvExtraction')

    writer.write('This is the content of the extraction file for a fragmented extraction.')

    writer.addFragment(Readable.from(['# Product Documentation\n\n...intro...']))
    writer.addFragment(Readable.from(['## Installation\n\n...including ### Prerequisites...']))
    writer.addFragment(Readable.from(['## Configuration\n\n...']))
    writer.addFragment(Readable.from(['## Usage\n\n...']))
    writer.addFragment(Readable.from(['# Advanced Topics\n\n...']))
    writer.addFragment(Readable.from(['## Troubleshooting\n\n...']))

    const extractionManifest = await writer.ack()

    expect(extractionManifest).toBeDefined()

    expect(extractionManifest.storageStats.extractionFileCount).toBe(7) // 6 fragments + one output.md for the write
    expect(extractionManifest.storageStats.physicalFileCount).toBe(8) // 6 fragments + output.md + metadata.json
  })

  it('should combine all data from an fragmented extraction when no fragment index was specified', async () => {
    const extractionReadStream = await readExtraction({
      ...TEST_DOCUMENT_MANIFEST,
      type: 'extraction',
      extractionMethod: 'csvExtraction',
    })
    expect(extractionReadStream).toBeDefined()

    const contentLines: string[] = []
    const fragments: string[] = []
    for await (const line of extractionReadStream) {
      contentLines.push(line)
      if (RegExp(/Fragment Content Start/i).test(line)) {
        fragments.push(line)
      }
    }

    expect(fragments.length).toBe(6)
    const extractedContent = contentLines.join('\n')
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

  it('should read a single fragment together with the output.md content if fragment index was speficied', async () => {
    const stream = await readExtraction(
      {
        ...TEST_DOCUMENT_MANIFEST,
        type: 'extraction',
        extractionMethod: 'csvExtraction',
      },
      2,
    )
    expect(stream).toBeDefined()

    const lines: string[] = []
    for await (const line of stream) {
      lines.push(line)
    }

    const content = lines.join('\n')

    console.log('Extracted Content:\n', content)

    // Should have separators for each extraction method
    const fragmentSeparatorCount = lines.filter((line) => RegExp(/Fragment Content Start/i).test(line)).length
    expect(fragmentSeparatorCount).toBe(1) // text-extraction + fragmented-extraction

    const extractionMethodCount = lines.filter((line) => RegExp(/Extraction Start/i).test(line)).length
    expect(extractionMethodCount).toBe(1) // text-extraction + fragmented-extraction

    const statusLineCount = lines.filter((line) => RegExp(/Retrieving fragment 2 of 6/i).test(line)).length
    expect(statusLineCount).toBe(1)

    // Should contain content from both extractions
    expect(content).toContain('This is the content of the extraction file') // from text-extraction
    expect(content).toContain('### Prerequisites') // from fragmented-extraction
    expect(content).not.toContain('## Configuration') // from fragmented-extraction, but not in fragment 2
  })
})
