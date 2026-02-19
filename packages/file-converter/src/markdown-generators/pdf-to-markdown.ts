import { createRequire } from 'node:module'
import { Readable } from 'node:stream'
import { GlobalWorkerOptions, OPS, getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'

import { ExtractionWriter, document, extraction } from '@george-ai/file-management'

import { PDF_LAYOUT } from '../constants'
import { FileConverterParameters, logger } from './common'

// Screenshot scale for OCR (3x = 216 DPI, good for OCR processing)
const PAGE_SCREENSHOT_SCALE = 3

// Image extraction types
interface ExtractedImage {
  filename: string
  data: Uint8Array
  width: number
  height: number
  mimeType: 'image/png' | 'image/jpeg'
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks)
}

// Advanced PDF to Markdown converter that preserves layout and structure
export async function pdfToMarkdown(parameters: FileConverterParameters) {
  const { workspaceId, libraryId, documentId, timeoutSignal } = parameters
  logger.debug('Starting PDF conversion', { workspaceId, libraryId, documentId })

  const fileManifest = await document.get(workspaceId, {
    libraryId,
    documentId,
  })

  const { stream: sourceStream } = await document.readSource(workspaceId, {
    libraryId,
    documentId,
  })

  const extractionWriter = await extraction.create(fileManifest, 'pdfExtraction')

  try {
    await extractFromPDF(sourceStream, timeoutSignal, extractionWriter)
    const result = await extractionWriter.ack()
    logger.debug('PDF conversion completed', { workspaceId, libraryId, documentId })
    return result
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    logger.error('PDF conversion failed', { error: errorMessage, workspaceId, libraryId, documentId })
    await extractionWriter.nack(error instanceof Error ? error : undefined)
    throw error
  }
}

async function extractFromPDF(
  pdfStream: Readable,
  timeoutSignal: AbortSignal,
  extractionWriter: ExtractionWriter,
): Promise<void> {
  const require = createRequire(import.meta.url)
  const workerPath = require.resolve('pdfjs-dist/legacy/build/pdf.worker.min.mjs')
  GlobalWorkerOptions.workerSrc = workerPath

  // Get paths to cmaps and standard fonts from pdfjs-dist package
  const pdfjsLibFolder = require.resolve('pdfjs-dist').replace('/pdfjs-dist/build/pdf.mjs', '')
  const CMAP_URL = pdfjsLibFolder + '/cmaps/'
  const CMAP_PACKED = true
  const STANDARD_FONT_DATA_URL = pdfjsLibFolder + '/standard_fonts/'

  // PDF.js requires buffer/ArrayBuffer - streams not supported
  // (PDF cross-reference table is at end of file, needs random access)
  const buffer = await streamToBuffer(pdfStream)

  const pdfDocument = await getDocument({
    data: new Uint8Array(buffer),
    cMapUrl: CMAP_URL,
    cMapPacked: CMAP_PACKED,
    standardFontDataUrl: STANDARD_FONT_DATA_URL,
  }).promise

  const numPages = pdfDocument.numPages
  logger.info('PDF document loaded', { numPages, bufferSizeMB: (buffer.length / 1024 / 1024).toFixed(2) })

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    if (timeoutSignal.aborted) {
      logger.warn('Conversion aborted due to timeout', { pageNum, numPages })
      break
    }

    const { pageMarkdown, images } = await processPage(pdfDocument, pageNum)

    // Yield page content immediately to allow garbage collection
    await extractionWriter.write(cleanupPageMarkdown(pageMarkdown))

    for (const image of images) {
      extractionWriter.addAttachment(image.filename, Readable.from([image.data]), image.mimeType)
    }

    // Add high-resolution page screenshot for OCR processing
    const screenshot = await renderPageScreenshot(pdfDocument, pageNum, PAGE_SCREENSHOT_SCALE)
    if (screenshot) {
      extractionWriter.addAttachment(screenshot.filename, Readable.from([screenshot.data]), 'image/png')
      await extractionWriter.write(`\n![Page ${pageNum} Screenshot](attachments/${screenshot.filename})\n`)
    }

    // Add page separator (except for last page)
    if (pageNum < numPages) {
      await extractionWriter.write('\n---\n\n')
    }

    // Log progress for large documents
    if (numPages > 10 && pageNum % 10 === 0) {
      logger.debug('Processing progress', {
        pageNum,
        numPages,
        percentComplete: Math.round((pageNum / numPages) * 100),
      })
    }
  }

  logger.debug('PDF conversion complete', { numPages })
}

// Process a single page and return its markdown content
async function processPage(
  pdfDocument: Awaited<ReturnType<typeof getDocument>['promise']>,
  pageNum: number,
): Promise<{ pageMarkdown: string; images: ExtractedImage[] }> {
  const page = await pdfDocument.getPage(pageNum)

  try {
    const textContent = await page.getTextContent()
    const annotations = await page.getAnnotations()

    // Extract images from the page
    const images = await extractImagesFromPage(page, pageNum)

    // Group text items by their vertical position to identify lines
    const lines: Array<{
      y: number
      items: Array<{ text: string; x: number; width: number; height: number; fontName?: string; isFormField?: boolean }>
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

    // Extract form field values from annotations
    for (const annot of annotations) {
      // Only process Widget annotations (form fields) with values
      if (annot.subtype !== 'Widget') continue

      let fieldValue = ''

      // Handle different field types
      if (annot.fieldType === 'Tx' && annot.fieldValue) {
        // Text field
        fieldValue = String(annot.fieldValue).trim()
      } else if (annot.fieldType === 'Ch' && annot.fieldValue) {
        // Choice field (dropdown/listbox)
        if (Array.isArray(annot.fieldValue)) {
          fieldValue = annot.fieldValue.filter((v: string) => v && v.trim()).join(', ')
        } else {
          fieldValue = String(annot.fieldValue).trim()
        }
      } else if (annot.fieldType === 'Btn' && annot.fieldValue && annot.buttonValue) {
        // Button/checkbox - only include if it's the selected option
        if (annot.fieldValue === annot.buttonValue) {
          fieldValue = '[X] ' + annot.buttonValue
        }
      }

      // Skip empty values or signature fields
      if (!fieldValue || annot.fieldType === 'Sig') continue

      // rect is [x1, y1, x2, y2] in PDF coordinates (y from bottom)
      const rect = annot.rect as [number, number, number, number]
      const x = Math.round(rect[0])
      const y = Math.round(rect[1]) // Use bottom Y of the field
      const width = Math.round(rect[2] - rect[0])
      const height = Math.round(rect[3] - rect[1])

      // Find or create line for this Y position (use larger threshold for form fields)
      let line = lines.find((l) => Math.abs(l.y - y) < PDF_LAYOUT.FORM_FIELD_Y_THRESHOLD)
      if (!line) {
        line = { y, items: [] }
        lines.push(line)
      }

      line.items.push({
        text: fieldValue,
        x: x,
        width: width,
        height: height,
        isFormField: true,
      })
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

    // Process each line and build page markdown
    let pageMarkdown = ''
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
          pageMarkdown += '\n'
        }
        const processedLine = processLineForMarkdown(lineText, { isBold: usesHeadingFont, hasExtraSpaceAbove })
        pageMarkdown += processedLine + '\n'
      }

      prevLineY = line.y
    }

    // Append images at the end of the page content
    if (images.length > 0) {
      pageMarkdown += '\n'
      for (let i = 0; i < images.length; i++) {
        const img = images[i]
        pageMarkdown += `![Page ${pageNum} Image ${i + 1}](attachments/${img.filename})\n\n`
      }
      logger.debug('Images extracted from page', { pageNum, imageCount: images.length })
    }

    return { pageMarkdown, images }
  } finally {
    // Clean up page resources to free memory
    page.cleanup()
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

// Extract images from a PDF page
async function extractImagesFromPage(
  page: Awaited<ReturnType<Awaited<ReturnType<typeof getDocument>['promise']>['getPage']>>,
  pageNum: number,
): Promise<ExtractedImage[]> {
  const images: ExtractedImage[] = []

  try {
    const operatorList = await page.getOperatorList()

    // Track which image objects we've processed to avoid duplicates
    const processedImages = new Set<string>()

    for (let i = 0; i < operatorList.fnArray.length; i++) {
      const op = operatorList.fnArray[i]

      // Check for image painting operations
      if (op === OPS.paintImageXObject) {
        const imageName = operatorList.argsArray[i][0] as string

        // Skip if we've already processed this image
        if (processedImages.has(imageName)) continue
        processedImages.add(imageName)

        try {
          // Get the image object from the page's object store with timeout
          const imgData = await Promise.race([
            new Promise<{
              data: Uint8Array | Uint8ClampedArray
              width: number
              height: number
              kind?: number
            } | null>((resolve) => {
              page.objs.get(
                imageName,
                (
                  img: { data: Uint8Array | Uint8ClampedArray; width: number; height: number; kind?: number } | null,
                ) => {
                  if (img && img.data) {
                    resolve(img)
                  } else {
                    resolve(null)
                  }
                },
              )
            }),
            // Timeout after 500ms to prevent hanging
            new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)),
          ])

          if (!imgData || !imgData.data || imgData.width === 0 || imgData.height === 0) {
            continue
          }

          // Convert image data to PNG or use JPEG if available
          const imageBytes = convertToPngOrJpeg({
            pageIndex: pageNum,
            imageIndex: images.length + 1,
            data: imgData.data,
            width: imgData.width,
            height: imgData.height,
            kind: imgData.kind,
          })
          if (imageBytes) {
            images.push(imageBytes)
          }
        } catch (imgError) {
          logger.debug('Failed to extract image', { pageNum, imageName, error: String(imgError) })
        }
      }
    }
  } catch (error) {
    logger.debug('Error extracting images from page', { pageNum, error: String(error) })
  }

  return images
}

// Render a page as a high-resolution PNG screenshot for OCR processing
async function renderPageScreenshot(
  pdfDocument: Awaited<ReturnType<typeof getDocument>['promise']>,
  pageNum: number,
  scale: number,
): Promise<{ filename: string; data: Buffer } | null> {
  try {
    const page = await pdfDocument.getPage(pageNum)

    try {
      const viewport = page.getViewport({ scale })
      const canvasFactory = pdfDocument.canvasFactory

      // @ts-expect-error - canvasFactory type definition is incomplete
      const canvasAndContext = canvasFactory.create(viewport.width, viewport.height)

      const renderContext = {
        canvasContext: canvasAndContext.context,
        canvas: canvasAndContext.canvas,
        viewport,
      }

      await page.render(renderContext).promise

      // Set DPI metadata in PNG (scale * 72 DPI)
      const dpi = 72 * scale
      const pixelsPerMeter = Math.round(dpi * 39.3701) // Convert DPI to pixels per meter

      const buffer = canvasAndContext.canvas.toBuffer('image/png', {
        resolution: pixelsPerMeter, // This sets the pHYs chunk in PNG
      })

      return {
        filename: `page_${pageNum}_screenshot.png`,
        data: buffer,
      }
    } finally {
      page.cleanup()
    }
  } catch (error) {
    logger.debug('Failed to render page screenshot', { pageNum, error: String(error) })
    return null
  }
}

// Convert raw image data to PNG or JPEG format
function convertToPngOrJpeg(imgData: {
  pageIndex: number
  imageIndex: number
  data: Uint8Array | Uint8ClampedArray
  width: number
  height: number
  kind?: number
}): ExtractedImage | null {
  const { pageIndex, imageIndex, data, width, height, kind } = imgData

  // kind: 1 = grayscale, 2 = RGB, 3 = RGBA

  try {
    // Check if the data is already JPEG (starts with JPEG magic bytes)
    if (data[0] === 0xff && data[1] === 0xd8) {
      return {
        filename: `page_${pageIndex}_image_${imageIndex}.jpg`,
        data: new Uint8Array(data),
        width,
        height,
        mimeType: 'image/jpeg',
      }
    }

    // For RGBA/RGB data, create a simple PNG
    const png = createSimplePng(data, width, height, kind || 2)
    return {
      filename: `page_${pageIndex}_image_${imageIndex}.png`,
      data: png,
      width,
      height,
      mimeType: 'image/png',
    }
  } catch (error) {
    logger.debug('Failed to convert image', { width, height, kind, error: String(error) })
    return null
  }
}

// Create a simple uncompressed PNG from raw pixel data
function createSimplePng(
  data: Uint8Array | Uint8ClampedArray,
  width: number,
  height: number,
  kind: number,
): Uint8Array {
  // Determine bytes per pixel based on kind
  const channels = kind === 1 ? 1 : kind === 2 ? 3 : 4
  const expectedLength = width * height * channels

  // Validate data length
  if (data.length < expectedLength) {
    throw new Error(`Image data too short: ${data.length} < ${expectedLength}`)
  }

  // PNG signature
  const signature = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])

  // IHDR chunk (image header)
  const ihdr = createPngChunk('IHDR', [
    (width >> 24) & 0xff,
    (width >> 16) & 0xff,
    (width >> 8) & 0xff,
    width & 0xff,
    (height >> 24) & 0xff,
    (height >> 16) & 0xff,
    (height >> 8) & 0xff,
    height & 0xff,
    8, // bit depth
    kind === 1 ? 0 : kind === 2 ? 2 : 6, // color type: 0=grayscale, 2=RGB, 6=RGBA
    0, // compression method
    0, // filter method
    0, // interlace method
  ])

  // IDAT chunk (image data) - uncompressed with zlib wrapper
  const rawData = new Uint8Array(height * (1 + width * channels))
  let offset = 0
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0 // filter type: none
    for (let x = 0; x < width * channels; x++) {
      rawData[offset++] = data[y * width * channels + x]
    }
  }

  // Simple zlib wrapper for uncompressed data (deflate with no compression)
  const zlibData = createUncompressedZlib(rawData)
  const idat = createPngChunk('IDAT', zlibData)

  // IEND chunk
  const iend = createPngChunk('IEND', [])

  // Combine all parts
  const png = new Uint8Array(signature.length + ihdr.length + idat.length + iend.length)
  let pos = 0
  png.set(signature, pos)
  pos += signature.length
  png.set(ihdr, pos)
  pos += ihdr.length
  png.set(idat, pos)
  pos += idat.length
  png.set(iend, pos)

  return png
}

// Create a PNG chunk with CRC
function createPngChunk(type: string, data: number[] | Uint8Array): Uint8Array {
  const dataArray = data instanceof Uint8Array ? data : new Uint8Array(data)
  const chunk = new Uint8Array(4 + 4 + dataArray.length + 4)

  // Length
  const len = dataArray.length
  chunk[0] = (len >> 24) & 0xff
  chunk[1] = (len >> 16) & 0xff
  chunk[2] = (len >> 8) & 0xff
  chunk[3] = len & 0xff

  // Type
  for (let i = 0; i < 4; i++) {
    chunk[4 + i] = type.charCodeAt(i)
  }

  // Data
  chunk.set(dataArray, 8)

  // CRC (over type + data)
  const crcData = new Uint8Array(4 + dataArray.length)
  for (let i = 0; i < 4; i++) {
    crcData[i] = type.charCodeAt(i)
  }
  crcData.set(dataArray, 4)
  const crc = calculateCrc32(crcData)
  chunk[8 + dataArray.length] = (crc >> 24) & 0xff
  chunk[9 + dataArray.length] = (crc >> 16) & 0xff
  chunk[10 + dataArray.length] = (crc >> 8) & 0xff
  chunk[11 + dataArray.length] = crc & 0xff

  return chunk
}

// Create uncompressed zlib data (deflate stored blocks)
function createUncompressedZlib(data: Uint8Array): Uint8Array {
  // Zlib header for no compression
  const header = new Uint8Array([0x78, 0x01]) // CMF, FLG (no compression)

  // Split data into 65535-byte blocks (max for stored blocks)
  const maxBlockSize = 65535
  const numBlocks = Math.ceil(data.length / maxBlockSize)
  const blocks: Uint8Array[] = []

  for (let i = 0; i < numBlocks; i++) {
    const isLast = i === numBlocks - 1
    const start = i * maxBlockSize
    const end = Math.min(start + maxBlockSize, data.length)
    const blockData = data.slice(start, end)
    const blockLen = blockData.length

    // Block header: 1 byte (BFINAL + BTYPE), 2 bytes LEN, 2 bytes NLEN
    const blockHeader = new Uint8Array(5)
    blockHeader[0] = isLast ? 0x01 : 0x00 // BFINAL=1 for last, BTYPE=00 (stored)
    blockHeader[1] = blockLen & 0xff
    blockHeader[2] = (blockLen >> 8) & 0xff
    blockHeader[3] = ~blockLen & 0xff
    blockHeader[4] = (~blockLen >> 8) & 0xff

    const block = new Uint8Array(5 + blockLen)
    block.set(blockHeader, 0)
    block.set(blockData, 5)
    blocks.push(block)
  }

  // Calculate Adler-32 checksum
  const adler = calculateAdler32(data)

  // Combine header, blocks, and checksum
  const totalBlocksLen = blocks.reduce((sum, b) => sum + b.length, 0)
  const result = new Uint8Array(2 + totalBlocksLen + 4)
  result.set(header, 0)
  let pos = 2
  for (const block of blocks) {
    result.set(block, pos)
    pos += block.length
  }
  result[pos] = (adler >> 24) & 0xff
  result[pos + 1] = (adler >> 16) & 0xff
  result[pos + 2] = (adler >> 8) & 0xff
  result[pos + 3] = adler & 0xff

  return result
}

// Calculate CRC32 for PNG chunks
function calculateCrc32(data: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < data.length; i++) {
    crc ^= data[i]
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0)
    }
  }
  return crc ^ 0xffffffff
}

// Calculate Adler-32 checksum for zlib
function calculateAdler32(data: Uint8Array): number {
  let a = 1
  let b = 0
  for (let i = 0; i < data.length; i++) {
    a = (a + data[i]) % 65521
    b = (b + a) % 65521
  }
  return (b << 16) | a
}

// Clean up markdown for a single page (called per-page during streaming)
function cleanupPageMarkdown(markdown: string): string {
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
      .trim()
  )
}
