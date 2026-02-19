import { NodeHtmlMarkdown } from '@kingsword/node-html-markdown'
import { AddressObject, simpleParser } from 'mailparser'
import { Readable } from 'stream'

import { document, extraction } from '@george-ai/file-management'

import { FileConverterParameters, logger } from './common'

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = []
  for await (const chunk of stream) {
    chunks.push(chunk as Buffer)
  }
  return Buffer.concat(chunks)
}

// Helper to extract text from address fields
const getAddressText = (addr: AddressObject | AddressObject[] | undefined): string => {
  if (!addr) return '(Unknown)'
  if (Array.isArray(addr)) {
    return addr.map((a) => a.text).join(', ')
  }
  return addr.text
}

// Format date in human-readable format
const formatDate = (date: Date | undefined): string => {
  if (!date) return '(Unknown)'
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

// Clean HTML before conversion
const cleanHtml = (html: string): string => {
  let cleaned = html

  // Remove tracking pixels and small images (1x1 pixels, etc.)
  cleaned = cleaned.replace(/<img[^>]*(?:width|height)=["']1["'][^>]*>/gi, '')

  // Remove style tags and their content
  cleaned = cleaned.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')

  // Remove script tags and their content
  cleaned = cleaned.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')

  // Clean up tracking parameters from URLs (common email tracking params)
  cleaned = cleaned.replace(/(\?|&)(utm_[^&"'\s]+|source=[^&"'\s]+|medium=[^&"'\s]+|campaign=[^&"'\s]+)/g, '')

  // Convert layout tables to divs (tables with role="presentation" are layout, not data)
  cleaned = cleaned.replace(/<table[^>]*role=["']presentation["'][^>]*>/gi, '<div>')
  cleaned = cleaned.replace(/<\/table>/gi, '</div>')
  cleaned = cleaned.replace(/<tbody[^>]*>/gi, '<div>')
  cleaned = cleaned.replace(/<\/tbody>/gi, '</div>')
  cleaned = cleaned.replace(/<tr[^>]*>/gi, '<div>')
  cleaned = cleaned.replace(/<\/tr>/gi, '</div>')
  cleaned = cleaned.replace(/<td[^>]*>/gi, '<span>')
  cleaned = cleaned.replace(/<\/td>/gi, '</span> ')

  return cleaned
}

export async function emlToMarkdown(parameters: FileConverterParameters) {
  logger.debug('[EML Converter] Starting conversion', parameters)

  const { workspaceId, libraryId, documentId } = parameters

  const fileManifest = await document.get(workspaceId, {
    libraryId,
    documentId,
  })
  const { stream: readStream } = await document.readSource(workspaceId, {
    libraryId,
    documentId,
  })

  // simpleParser can accept a stream, but we need the buffer for reliable parsing
  const buffer = await streamToBuffer(readStream)

  // Parse the email
  const parsed = await simpleParser(buffer)

  // Extract headers
  const headers = [
    `# ${parsed.subject || '(No Subject)'}`,
    '',
    `**From:** ${getAddressText(parsed.from)}  `,
    `**To:** ${getAddressText(parsed.to)}  `,
    parsed.cc ? `**CC:** ${getAddressText(parsed.cc)}  ` : null,
    `**Date:** ${formatDate(parsed.date)}`,
    '',
    '---',
    '',
  ]
    .filter(Boolean)
    .join('\n')

  // Extract body content
  let bodyMarkdown = ''

  // Prefer plain text if HTML is complex (table-based layout emails)
  const isComplexHtml =
    (typeof parsed.html === 'string' && parsed.html.includes('mj-')) ||
    (typeof parsed.html === 'string' && parsed.html.includes('role="presentation"'))

  if (parsed.text && (isComplexHtml || !parsed.html)) {
    // Use plain text for complex emails or when no HTML
    bodyMarkdown = parsed.text
  } else if (parsed.html) {
    // Clean and convert HTML to markdown
    const cleanedHtml = cleanHtml(parsed.html)

    bodyMarkdown = NodeHtmlMarkdown.translate(cleanedHtml, {
      // Ignore decorative elements
      ignore: ['img[width="20"]', 'img[height="20"]', 'img[width="1"]', 'img[height="1"]', 'style', 'meta'],
      // Use link reference definitions
      useLinkReferenceDefinitions: false, // Inline links are clearer
      // Limit newlines
      maxConsecutiveNewlines: 2,
    })

    // Post-process: clean up
    bodyMarkdown = bodyMarkdown
      .replace(/\n{3,}/g, '\n\n') // Max 2 consecutive newlines
      .replace(/\s{2,}/g, ' ') // Collapse multiple spaces
      .replace(/^\s*\n/gm, '\n') // Remove whitespace-only lines
      .trim()
  }

  const fullMarkdown = (headers + bodyMarkdown).trim()

  const extractionWriter = await extraction.create(fileManifest, 'emlExtraction')

  try {
    await extractionWriter.write(fullMarkdown)
    const result = await extractionWriter.ack()
    logger.debug('[EML Converter] Conversion completed', parameters)
    return result
  } catch (error) {
    await extractionWriter.nack(error instanceof Error ? error : undefined)
    logger.error('[EML Converter] Conversion failed', { ...parameters, error })
    throw error
  }
}
