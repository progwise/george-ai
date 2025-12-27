import fs from 'fs'
import { createRequire } from 'node:module'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

import { PDF_LAYOUT } from '../constants'
import { FileConverterResult } from './types'

//Advanced PDF to Markdown converter that preserves layout and structure
export async function transformPdfToMarkdown(
  pdfFilePath: string,
  timeoutSignal: AbortSignal,
): Promise<FileConverterResult> {
  const require = createRequire(import.meta.url)
  const processingStart = Date.now()
  try {
    const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
    GlobalWorkerOptions.workerSrc = workerPath

    // Get paths to cmaps and standard fonts from pdfjs-dist package
    const pdfjsLibFolder = require.resolve('pdfjs-dist').replace('/pdfjs-dist/build/pdf.mjs', '')
    const CMAP_URL = pdfjsLibFolder + '/cmaps/'
    const CMAP_PACKED = true
    const STANDARD_FONT_DATA_URL = pdfjsLibFolder + '/standard_fonts/'

    console.log('Converting PDF to markdown with advanced layout preservation:', pdfFilePath)

    const pdfData = new Uint8Array(fs.readFileSync(pdfFilePath))

    const pdfDocument = await getDocument({
      data: pdfData,
      cMapUrl: CMAP_URL,
      cMapPacked: CMAP_PACKED,
      standardFontDataUrl: STANDARD_FONT_DATA_URL,
    }).promise

    let fullMarkdown = ''
    const totalPages = pdfDocument.numPages

    for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
      if (timeoutSignal.aborted) {
        console.error(`❌ PDF to Markdown conversion aborted due to timeout`)
        return {
          markdownContent: fullMarkdown,
          processingTimeMs: Date.now() - processingStart,
          metadata: {
            totalPages,
          },
          timeout: true,
          partialResult: true,
          success: false,
        }
      }
      const page = await pdfDocument.getPage(pageNum)
      const textContent = await page.getTextContent()

      // Group text items by their vertical position to identify lines
      const lines: Array<{
        y: number
        items: Array<{ text: string; x: number; width: number; height: number; fontName?: string }>
      }> = []

      for (const item of textContent.items) {
        if ('str' in item && item.str.trim()) {
          const y = Math.round(item.transform[5])
          const x = Math.round(item.transform[4])

          let line = lines.find((l) => Math.abs(l.y - y) < PDF_LAYOUT.VERTICAL_LINE_THRESHOLD)
          if (!line) {
            line = { y, items: [] }
            lines.push(line)
          }

          line.items.push({
            text: item.str,
            x: x,
            width: item.width || 0,
            height: item.height || 0,
            fontName: item.fontName,
          })
        }
      }

      // Sort lines by Y position (top to bottom)
      lines.sort((a, b) => b.y - a.y)

      // Determine the most common font (likely body text font)
      const fontUsage = new Map<string, number>()
      for (const line of lines) {
        for (const item of line.items) {
          if (item.fontName) {
            fontUsage.set(item.fontName, (fontUsage.get(item.fontName) || 0) + item.text.length)
          }
        }
      }
      let bodyFont = ''
      let maxUsage = 0
      for (const [font, usage] of fontUsage) {
        if (usage > maxUsage) {
          maxUsage = usage
          bodyFont = font
        }
      }

      // Process each line
      let prevLineY: number | null = null

      for (const line of lines) {
        // Sort items in line by X position (left to right)
        line.items.sort((a, b) => a.x - b.x)

        let lineText = ''
        let prevX: number | null = null
        let avgHeight = 0

        // Determine if line uses heading font:
        // Check if any item has bold in font name OR uses a different font than body text
        const usesHeadingFont = line.items.some(
          (item) => item.fontName && (/bold/i.test(item.fontName) || item.fontName !== bodyFont),
        )

        for (const item of line.items) {
          avgHeight += item.height

          // Add spacing based on gap size
          if (prevX !== null) {
            const gap = item.x - prevX

            if (gap > PDF_LAYOUT.LARGE_GAP_THRESHOLD) {
              lineText += ' | ' // Large gap - likely column separator
            } else {
              // Always add space between separate text items
              lineText += ' '
            }
          }

          lineText += item.text
          prevX = item.x + item.width
        }

        avgHeight = line.items.length > 0 ? avgHeight / line.items.length : 0

        // Calculate vertical gap from previous line (remember: Y decreases going down the page)
        const hasExtraSpaceAbove =
          prevLineY !== null && prevLineY - line.y > avgHeight * PDF_LAYOUT.HEADING_SPACE_MULTIPLIER

        // Clean up the line text
        lineText = lineText.trim()

        if (lineText) {
          // Add blank line before paragraphs with extra vertical space (preserves paragraph breaks)
          if (hasExtraSpaceAbove && prevLineY !== null) {
            fullMarkdown += '\n'
          }
          const processedLine = processLineForMarkdown(lineText, { isBold: usesHeadingFont, hasExtraSpaceAbove })
          fullMarkdown += processedLine + '\n'
        }

        prevLineY = line.y
      }

      if (pageNum < pdfDocument.numPages) {
        fullMarkdown += '\n---\n\n' // Page separator
      }
    }

    const cleanedMarkdown = cleanupMarkdown(fullMarkdown)

    return {
      markdownContent: cleanedMarkdown,
      processingTimeMs: Date.now() - processingStart,
      metadata: {
        totalPages,
      },
      timeout: false,
      partialResult: false,
      success: true,
    }
  } catch (error) {
    console.error(`Error converting PDF to markdown:`, error)
    return {
      markdownContent: '',
      processingTimeMs: Date.now() - processingStart,
      notes: (error as Error).message,
      timeout: false,
      partialResult: false,
      success: false,
    }
  }
}

interface LineContext {
  isBold: boolean
  hasExtraSpaceAbove: boolean
}

function processLineForMarkdown(line: string, context: LineContext): string {
  // Remove excessive whitespace
  line = line.replace(/\s+/g, ' ').trim()

  if (!line) return ''

  // Try to identify headings based on patterns (language-agnostic)
  if (
    line.match(/^[A-Z][A-Z\s]{10,}$/) || // ALL CAPS lines (10+ chars)
    line.match(/^\d+\.\s+[A-Z]/) // Numbered headings like "1. Introduction"
  ) {
    const level = line.match(/^\d+\.\s/) ? 3 : 2
    return '#'.repeat(level) + ' ' + line
  }

  // Short bold lines with extra space above are likely headings (e.g., "Von", "An")
  // But exclude lines that look like metadata (contain colons, dates, quantities)
  if (
    context.isBold &&
    context.hasExtraSpaceAbove &&
    line.length < 40 &&
    !line.match(/[.!?]$/) && // Doesn't end with punctuation
    !line.includes(':') && // Not a "label: value" pattern
    !line.match(/\d{2}[./]\d{2}[./]\d{2,4}/) && // Not a date
    !line.match(/^\d+[×x]?\s/) // Doesn't start with quantity like "1×" or "2x"
  ) {
    return '## ' + line
  }

  // Try to identify bullet points
  if (
    line.match(/^[•·▪▫▸▹‣⁃]\s/) ||
    line.match(/^[-*+]\s/) ||
    line.match(/^\d+\.\s/) ||
    line.match(/^[a-z]\)\s/) ||
    line.match(/^[ivx]+\.\s/i)
  ) {
    if (!line.startsWith('- ') && !line.match(/^\d+\.\s/)) {
      return '- ' + line.replace(/^[•·▪▫▸▹‣⁃\-*+]\s*/, '')
    }
    return line
  }

  // Check for table-like content (contains | separators)
  if (line.includes(' | ')) {
    return line
  }

  return line
}

function cleanupMarkdown(markdown: string): string {
  return (
    markdown
      // Clean up excessive newlines
      .replace(/\n{4,}/g, '\n\n\n')
      // Fix heading spacing
      .replace(/^(#{1,6})\s*/gm, '$1 ')
      // Clean up list formatting
      .replace(/^[\s]*[-*+]\s+/gm, '- ')
      // Remove trailing whitespace
      .replace(/[ \t]+$/gm, '')
      // Ensure single newline at end
      .trim() + '\n'
  )
}
