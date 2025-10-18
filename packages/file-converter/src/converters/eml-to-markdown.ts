import { NodeHtmlMarkdown } from '@kingsword/node-html-markdown'
import { simpleParser } from 'mailparser'
import fs from 'node:fs/promises'

import { ConverterResult } from './types'

export async function transformEmlToMarkdown(emlPath: string): Promise<ConverterResult> {
  const processingStart = Date.now()

  try {
    // Read the .eml file
    const emlContent = await fs.readFile(emlPath)

    // Parse the email
    const parsed = await simpleParser(emlContent)

    // Helper to extract text from address fields
    const getAddressText = (addr: typeof parsed.from | typeof parsed.to | typeof parsed.cc): string => {
      if (!addr) return '(Unknown)'
      if (Array.isArray(addr)) {
        return addr.map((a) => a.text).join(', ')
      }
      return addr.text
    }

    // Extract headers
    const headers = [
      `# Email: ${parsed.subject || '(No Subject)'}`,
      '',
      `**From:** ${getAddressText(parsed.from)}`,
      `**To:** ${getAddressText(parsed.to)}`,
      parsed.cc ? `**CC:** ${getAddressText(parsed.cc)}` : null,
      `**Date:** ${parsed.date?.toISOString() || '(Unknown)'}`,
      parsed.messageId ? `**Message-ID:** ${parsed.messageId}` : null,
      '',
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n')

    // Extract body content
    let bodyMarkdown = ''
    if (parsed.html) {
      // Convert HTML to markdown
      bodyMarkdown = NodeHtmlMarkdown.translate(parsed.html)
    } else if (parsed.text) {
      // Use plain text
      bodyMarkdown = parsed.text
    }

    const fullMarkdown = headers + bodyMarkdown

    return {
      markdownContent: fullMarkdown.trim(),
      processingTimeMs: Date.now() - processingStart,
      metadata: {
        from: getAddressText(parsed.from),
        to: getAddressText(parsed.to),
        cc: parsed.cc ? getAddressText(parsed.cc) : undefined,
        subject: parsed.subject,
        date: parsed.date?.toISOString(),
        messageId: parsed.messageId,
        hasHtml: !!parsed.html,
        hasText: !!parsed.text,
        attachmentCount: parsed.attachments?.length || 0,
      },
      timeout: false,
      partialResult: false,
      success: true,
    }
  } catch (error) {
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
