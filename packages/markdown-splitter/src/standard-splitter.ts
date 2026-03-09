import { createInterface } from 'node:readline/promises'
import { Readable } from 'node:stream'

import { logger } from './common'

function getChunkString(params: {
  headline: string
  breadcrumb: string[]
  content: string
  splitInfo?: { partIndex: number; totalParts: number }
}): string {
  const { headline, breadcrumb, content, splitInfo } = params

  const lines: string[] = []

  if (headline.trim().length) {
    lines.push(headline.trim())
  }

  if (breadcrumb.length > 0) {
    lines.push(`***Breadcrumb:*** > ${breadcrumb.filter(Boolean).join(' > ')}`)
  }

  if (splitInfo) {
    lines.push(`***Part ${splitInfo.partIndex + 1}/${splitInfo.totalParts}***`)
  }

  if (content.trim().length > 0) {
    lines.push(content.trim())
  } else if (lines.length > 0) {
    lines.push('No content')
  }

  if (lines.length > 0) {
    return lines.join('\n')
  }

  return ''
}

function getSplitChunks(params: {
  headline: string
  breadcrumb: string[]
  content: string
  maxCharsPerSection: number
  splitSectionOverlapLines: number
}) {
  const { headline, breadcrumb, content, maxCharsPerSection, splitSectionOverlapLines } = params

  const contentLength = content.length

  if (contentLength < maxCharsPerSection * 1.2) {
    return [getChunkString({ headline, breadcrumb, content: content.trim() })]
  }

  const splitChunks: string[] = []

  const splitLines = content.split('\n')
  const parts = Math.ceil(contentLength / maxCharsPerSection)
  const maxPartSize = Math.floor(contentLength / parts)
  let splitSize = 0
  let lastSplitIndex = 0
  let part = 0

  // TODO: Split by token count and not characters.
  let hasCodeBlock = false
  let isInsideCodeBlock = false
  let lastTableHeader: { headerRow: string; delimiterRow: string } | null = null

  for (let i = 0; i < splitLines.length; i++) {
    const line = splitLines[i]
    const trimmed = line.trim()
    if (trimmed.startsWith('```')) {
      hasCodeBlock = true
      isInsideCodeBlock = !isInsideCodeBlock
    }
    // Detect Table Header (a line followed by a |---| delimiter)
    if (!isInsideCodeBlock && trimmed.startsWith('|')) {
      const nextLine = splitLines[i + 1]?.trim() || ''
      if (nextLine.startsWith('|---') || nextLine.startsWith('| :--')) {
        lastTableHeader = { headerRow: line, delimiterRow: splitLines[i + 1] } // Store the header and the separator
      }
    }

    splitSize += splitLines[i].length

    if ((splitSize > maxPartSize && !isInsideCodeBlock) || i === splitLines.length - 1) {
      // Your padding logic: slice a bit extra but don't change the iterator state
      const start = Math.max(0, lastSplitIndex - splitSectionOverlapLines)
      const end = Math.min(splitLines.length, i + 1 + splitSectionOverlapLines)

      let content = splitLines.slice(start, end).join('\n').trim()
      const startsWithTableDelimiter = content.startsWith('|')
      const missingHeader = lastTableHeader && !content.includes(lastTableHeader.delimiterRow)

      if (startsWithTableDelimiter && missingHeader) {
        content = `${lastTableHeader?.headerRow}\n${lastTableHeader?.delimiterRow}\n${content}`
      }

      const chunkString = getChunkString({
        headline: headline,
        breadcrumb: breadcrumb,
        content,
        splitInfo: { partIndex: part, totalParts: parts },
      })

      splitChunks.push(chunkString)

      // 200 = overhead like breadcrumb, 1.2 = convenience factor, 2*300 = above and under the current chunk added lines
      if (!hasCodeBlock && chunkString.length > 200 + maxCharsPerSection * 1.2 + splitSectionOverlapLines * 2 * 300) {
        logger.warn('Split chunk still exceed the maxCharsPerSection', {
          contentLength,
          chunkLineCount: splitLines.length,
          part,
          parts,
          start,
          end,
          splitSize,
          lastSplitIndex,
          maxPartSize,
          actualPartSize: chunkString.length,
          maxCharsPerSection,
          splitSectionOverlapLines,
          chunkString,
        })
      }

      hasCodeBlock = false
      isInsideCodeBlock = false
      splitSize = 0
      part++
      lastSplitIndex = i + 1
    }
  }

  return splitChunks
}

export async function* splitMarkdownStream(
  markdownStream: Readable,
  options?: { maxCharsPerSection?: number; splitSectionOverlapLines?: number },
): AsyncGenerator<string, void, unknown> {
  const { maxCharsPerSection = 1000, splitSectionOverlapLines = 5 } = options || {}
  const readline = createInterface({ input: markdownStream, crlfDelay: Infinity })

  let currentChunk: string = ''
  let currentHeadline: string = ''
  let currentBreadcrumb: string[] = []

  for await (const line of readline) {
    const trimmedLine = line.trim()
    const headerMatch = trimmedLine.match(/^(#{1,6})\s+(.*)/)

    if (headerMatch) {
      // --- START: Flush Logic (Process the section we just finished) ---
      const chunkLength = currentChunk.length

      if (chunkLength > 0) {
        const splitChunks = getSplitChunks({
          headline: currentHeadline,
          breadcrumb: currentBreadcrumb,
          content: currentChunk,
          maxCharsPerSection,
          splitSectionOverlapLines,
        })
        yield* splitChunks
      }
      // --- END: Flush Logic ---

      // Update state for the NEW section found
      const level = headerMatch[1].length
      const title = headerMatch[2]
      currentBreadcrumb = currentBreadcrumb.slice(0, level - 1)
      currentBreadcrumb[level - 1] = title
      currentHeadline = trimmedLine
      currentChunk = ''
    } else {
      currentChunk += line + '\n' // Use original line to preserve semantic whitespace
    }
  }

  //Remaining content
  if (currentChunk.trim().length > 0 || currentHeadline.trim().length > 0) {
    const splitChunks = getSplitChunks({
      headline: currentHeadline,
      breadcrumb: currentBreadcrumb,
      content: currentChunk,
      maxCharsPerSection,
      splitSectionOverlapLines,
    })
    yield* splitChunks
  }
}
