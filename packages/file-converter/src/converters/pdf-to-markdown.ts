import fs from 'fs'
import { createRequire } from 'node:module'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

import { PDF_LAYOUT } from '../constants'

//Advanced PDF to Markdown converter that preserves layout and structure
export async function transformPdfToMarkdown(pdfFilePath: string): Promise<string> {
  const require = createRequire(import.meta.url)

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

  for (let pageNum = 1; pageNum <= pdfDocument.numPages; pageNum++) {
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

    // Process each line
    for (const line of lines) {
      // Sort items in line by X position (left to right)
      line.items.sort((a, b) => a.x - b.x)
      

      let lineText = ''
      let prevX = null

      for (const item of line.items) {
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

      // Clean up the line text
      lineText = lineText.trim()

      if (lineText) {
        const processedLine = processLineForMarkdown(lineText)
        fullMarkdown += processedLine + '\n'
      }
    }

    if (pageNum < pdfDocument.numPages) {
      fullMarkdown += '\n---\n\n' // Page separator
    }
  }

  return cleanupMarkdown(fullMarkdown)
}

function processLineForMarkdown(line: string): string {
  // Remove excessive whitespace
  line = line.replace(/\s+/g, ' ').trim()

  if (!line) return ''

  // Try to identify headings based on patterns
  if (
    line.match(/^[A-Z][A-Z\s]{10,}$/) || // ALL CAPS lines
    line.match(/^Chapter\s+\d+/i) || // Chapter headings
    line.match(/^Section\s+\d+/i) || // Section headings
    line.match(/^\d+\.\s+[A-Z]/) || // Numbered headings
    (line.match(/^[A-Z][^.!?]*$/) && line.length < 60)
  ) {
    // Short title-case lines
    const level = line.match(/^Chapter/i) ? 1 : line.match(/^Section/i) ? 2 : line.match(/^\d+\.\s/) ? 3 : 2
    return '#'.repeat(level) + ' ' + line
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
