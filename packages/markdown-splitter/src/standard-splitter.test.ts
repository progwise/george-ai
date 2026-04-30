import { fail } from 'assert'
import { Readable } from 'stream'

import { splitMarkdownStream } from './standard-splitter'

describe('Testing the basic default splitter', () => {
  it('Basic test with empty markdown should not return any chunks', async () => {
    const testMarkdown = `
    
    `

    const markdownStream = Readable.from(testMarkdown.split('\n'))

    let i = 0
    for await (const chunk of splitMarkdownStream(markdownStream, {
      maxCharsPerSection: 200,
      splitSectionOverlapLines: 2,
    })) {
      console.log(`chunk ${i++}`, chunk)
    }

    expect(i).toBe(0)
  })

  it('Basic test with simple markdown', async () => {
    const testMarkdown = `



    This is Michael, how are you?

    # About

    Michael loves coding but complicated algorithms reminds him that he is not too smart.


    But: Keep coding.

    ## Family

    A lot

    ## Nice things

    - Coding
    - Italy
    - Friends
    - Austria
    - Whistler

    #### Left out headline

    this has level 4 but no level 3 item. Invalid but shit happens.

    ### now it comes

    should have been before.... trying to break it, yeah...

    ## didn't break

    if you can read this, it did not break so far

    # Finé

    Das ist das Ende, thats the end

    `

    const markdownStream = Readable.from([testMarkdown])

    const chunks: string[] = []
    for await (const chunk of splitMarkdownStream(markdownStream, {
      maxCharsPerSection: 200,
      splitSectionOverlapLines: 2,
    })) {
      chunks.push(chunk)
    }

    expect(chunks.length).toBe(8)
    expect(chunks[0]).toContain('Michael')
    expect(chunks[0]).not.toContain('***Breadcrumb:***')

    expect(chunks[1].startsWith('# About')).toBeTruthy()
    expect(chunks[1]).toContain('***Breadcrumb:***')

    expect(chunks[2].startsWith('## Family')).toBeTruthy()
    expect(chunks[1]).toContain('***Breadcrumb:***')
  })

  describe('Testing for splitting tables and preserve table headers', () => {
    const markdownTable = (length: number) => {
      const head = '| Product ID | Category | Warehouse Location | Price | Stock Level | Last Restocked |'
      const delimiter = '| :--- | :--- | :--- | :--- | :--- | :--- |'

      const rows = Array.from({ length }).map(
        (_, index) =>
          `| PROD-${String(index).padStart(4, '0')} | Electronics | North-Sector-A | $1,200.00 | ${index} | 2024-01-15 |`,
      )

      return `${head}\n${delimiter}\n${rows.join('\n')}`
    }

    it('Should split a big table', async () => {
      const testMarkdown = `# Table test
      This one produces a huge table and finds out if the header and delimiter are repeated correctly in every split chunk

      ## Small table for warm up

      Here comes this huge insane table

      ${markdownTable(10)}

      End of small table

      ## Medium table

      Here comes a medium table

      ${markdownTable(30)}

      This was the medium.... but now....

      ## Big table

      Wow, I will expect this will not go well...

      ${markdownTable(500)}

      This have been 500 rows

      # End

      See you here..
      `

      const markdownStream = Readable.from([testMarkdown])

      const maxCharsPerSection = 1000
      const splitSectionOverlapLines = 2
      const chunks: string[] = []
      for await (const chunk of splitMarkdownStream(markdownStream, {
        maxCharsPerSection,
        splitSectionOverlapLines,
      })) {
        chunks.push(chunk)
        expect(chunk.length).toBeLessThan(200 + maxCharsPerSection * 1.2 + 2 * 300 * splitSectionOverlapLines)
      }

      expect(chunks.length).toBeGreaterThan(testMarkdown.length / 1000)
      expect(chunks[0]).toContain('Table test')
      expect(chunks[0]).toContain('***Breadcrumb:***')
    })
  })

  describe('Testing for not splitting code blocks', () => {
    const markdownCodeblock = `## Integration Logic

Below is the logic for the stream handler. It is vital that this block is not split in the middle, or the syntax highlighting will fail for the LLM.

\`\`\`typescript
  // First line of the code block
async function handleStream(input: Readable) {
  const stream = createInterface({ input });
  for await (const line of stream) {
    console.log("Processing line:", line);
    // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
        // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
        // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
        // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
    await processLine(line);
  }
}   

async function handleStream2(input: Readable) {
  const stream = createInterface({ input });
  for await (const line of stream) {
    console.log("Processing line:", line);
    // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
        // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
        // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
        // This logic is long enough to trigger a split if the guard fails.
    // We are adding more lines to ensure we hit the 200 char limit.
    // Testing... Testing... Testing...
    await processLine(line);
  }
}
  // Last line of the code block
\`\`\`
`
    it('Should not split a code block', async () => {
      const testMarkdown = `
      This is Michael
      
      # Section one
      
      no issues here
      
      ## Code example
      
      Here is some nice code example

      ${markdownCodeblock}

      What do you say?

      # Finish

      Its all over
      `

      const markdownStream = Readable.from([testMarkdown])

      const chunks: string[] = []
      for await (const chunk of splitMarkdownStream(markdownStream, {
        maxCharsPerSection: 200,
        splitSectionOverlapLines: 2,
      })) {
        chunks.push(chunk)
      }

      expect(chunks.length).toBe(6)
      expect(chunks[0]).toContain('Michael')
      expect(chunks[0]).not.toContain('***Breadcrumb:***')

      expect(chunks[1].startsWith('# Section one')).toBeTruthy()
      expect(chunks[1]).toContain('***Breadcrumb:***')

      expect(chunks[2].startsWith('## Code example')).toBeTruthy()
      expect(chunks[2]).toContain('***Breadcrumb:***')
      expect(chunks[2]).not.toContain('***Part')
      expect(chunks[3]).toContain('// Last line of the code block')
      expect(chunks[3]).toContain('// First line of the code block')

      expect(chunks[4]).not.toContain('typescript')
    })
  })

  describe('Testing with downloaded files from github', () => {
    const markdownUrls: Array<[string, number, number]> = [
      ['https://raw.githubusercontent.com/nodejs/node/main/README.md', 200, 0],
      ['https://raw.githubusercontent.com/nodejs/node/main/README.md', 400, 1],
      ['https://raw.githubusercontent.com/nodejs/node/main/README.md', 1000, 2],
      ['https://raw.githubusercontent.com/nodejs/node/main/README.md', 1000, 5],
      ['https://raw.githubusercontent.com/KaTeX/KaTeX/main/README.md', 200, 0],
      ['https://raw.githubusercontent.com/KaTeX/KaTeX/main/README.md', 400, 1],
      ['https://raw.githubusercontent.com/KaTeX/KaTeX/main/README.md', 1000, 2],
      ['https://raw.githubusercontent.com/KaTeX/KaTeX/main/README.md', 1000, 5],
    ]
    it.each(markdownUrls)(
      'Should chunk %s with streaming approach with maxCharsPerSection:%i and splitSectionOverlap:%i',
      async (url, maxCharsPerSection, splitSectionOverlapLines) => {
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

        let i = 0
        const splitChunks: string[] = []
        for await (const splitChunk of splitMarkdownStream(markdownStream, {
          maxCharsPerSection,
          splitSectionOverlapLines,
        })) {
          if (!splitChunk.includes('```')) {
            expect(
              splitChunk.length,
              `\n\nchunk ${i++} of ${url} (maxCharsPerSection: ${maxCharsPerSection}, splitSectionOverlap: ${splitSectionOverlapLines}): unexpected length ${splitChunk.length}\n\n ${splitChunk}\n\n`,
            ).toBeLessThan(200 + maxCharsPerSection * 1.2 + splitSectionOverlapLines * 300 * 2) // 200 = overhead like breadcrumb, 1.2 = Soft split,  300 = extimated max line length, 2 = additional lines before and after the split
          }
          expect(splitChunk.length).toBeGreaterThan(0)

          splitChunks.push(splitChunk)
          console.log(splitChunk)
        }

        expect(splitChunks.length).toBeGreaterThan(10)
      },
    )
  })
})
