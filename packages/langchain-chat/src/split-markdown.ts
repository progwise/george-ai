import { Document } from 'langchain/document'
import fs from 'node:fs'

const MAX_CHUNK_SIZE = 4000 // Maximum characters per chunk for vectorstore

interface ChunkMetadata {
  section: string
  headingPath: string
  chunkIndex: number
  subChunkIndex: number
}
/**
 * This splits a markdown file into multiple chunks based on the semantics of the markdown content.
 * It prioritizes splitting at heading boundaries to maintain context and tracks the heading hierarchy.
 */
export const splitMarkdown = (markdownFilePath: string): Document<ChunkMetadata>[] => {
  const content = fs.readFileSync(markdownFilePath, 'utf-8')

  // Split content into sections based on headings
  const sections = splitByHeadings(content)

  console.log(`Split markdown ${markdownFilePath} into ${sections.length} sections.`)

  // Create documents from sections, respecting MAX_CHUNK_SIZE
  const documents: Document<ChunkMetadata>[] = []

  for (const section of sections) {
    if (section.content.length <= MAX_CHUNK_SIZE) {
      // Section fits in one chunk
      documents.push(
        new Document({
          pageContent: section.content,
          metadata: {
            section: section.heading,
            headingPath: section.headingPath,
            chunkIndex: documents.length,
            subChunkIndex: 0,
          },
        }),
      )
    } else {
      // Section is too large, split it further
      const chunks = splitLargeSection(section.content, MAX_CHUNK_SIZE)
      chunks.forEach((chunk, index) => {
        documents.push(
          new Document({
            pageContent: chunk,
            metadata: {
              section: section.heading,
              headingPath: section.headingPath,
              chunkIndex: documents.length,
              subChunkIndex: index,
            },
          }),
        )
      })
    }
  }

  return documents
}

interface Section {
  heading: string
  headingPath: string
  content: string
  level: number
}

/**
 * Splits markdown content by headings (H1-H6) and tracks heading hierarchy
 */
function splitByHeadings(content: string): Section[] {
  const lines = content.split('\n')
  const sections: Section[] = []
  const headingStack: { level: number; heading: string }[] = []

  let currentSection: Section = {
    heading: 'Introduction',
    headingPath: 'Introduction',
    content: '',
    level: 0,
  }

  const headingRegex = /^(#{1,6})\s+(.+)$/

  for (const line of lines) {
    const match = line.match(headingRegex)

    if (match) {
      // Save current section if it has content
      if (currentSection.content.trim()) {
        sections.push(currentSection)
      }

      // Parse heading
      const level = match[1].length
      const heading = match[2].trim()

      // Update heading stack - remove headings at same or lower level
      while (headingStack.length > 0 && headingStack[headingStack.length - 1].level >= level) {
        headingStack.pop()
      }

      // Add current heading to stack
      headingStack.push({ level, heading })

      // Build heading path
      const headingPath = headingStack.map((h) => h.heading).join(' > ')

      // Start new section
      currentSection = {
        heading,
        headingPath,
        content: line + '\n',
        level,
      }
    } else {
      // Add line to current section
      currentSection.content += line + '\n'
    }
  }

  // Don't forget the last section
  if (currentSection.content.trim()) {
    sections.push(currentSection)
  }

  return sections
}

/**
 * Splits a large section into smaller chunks, trying to break at paragraph boundaries
 */
function splitLargeSection(content: string, maxSize: number): string[] {
  const chunks: string[] = []
  const paragraphs = content.split(/\n\n+/)

  let currentChunk = ''

  for (const paragraph of paragraphs) {
    // If adding this paragraph would exceed the limit
    if (currentChunk.length + paragraph.length + 2 > maxSize) {
      // If current chunk has content, save it
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }

      // If the paragraph itself is larger than maxSize, split it by sentences
      if (paragraph.length > maxSize) {
        const sentenceChunks = splitBySentences(paragraph, maxSize)
        chunks.push(...sentenceChunks)
      } else {
        currentChunk = paragraph
      }
    } else {
      // Add paragraph to current chunk
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    }
  }

  // Don't forget the last chunk
  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

/**
 * Splits text by sentences when even paragraphs are too large
 */
function splitBySentences(text: string, maxSize: number): string[] {
  const chunks: string[] = []
  // Simple sentence splitting - can be improved with better regex
  const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]

  let currentChunk = ''

  for (const sentence of sentences) {
    if (currentChunk.length + sentence.length > maxSize) {
      if (currentChunk.trim()) {
        chunks.push(currentChunk.trim())
        currentChunk = ''
      }

      // If a single sentence is larger than maxSize, we have to split it forcefully
      if (sentence.length > maxSize) {
        const hardChunks = splitHard(sentence, maxSize)
        chunks.push(...hardChunks)
      } else {
        currentChunk = sentence
      }
    } else {
      currentChunk += (currentChunk ? ' ' : '') + sentence
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

/**
 * Hard split for text that can't be split semantically
 */
function splitHard(text: string, maxSize: number): string[] {
  const chunks: string[] = []

  for (let i = 0; i < text.length; i += maxSize) {
    chunks.push(text.substring(i, i + maxSize))
  }

  return chunks
}
