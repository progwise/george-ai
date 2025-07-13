import { parse } from 'csv-parse/sync'
import fs from 'node:fs/promises'

//Convert CSV to Markdown table format
export async function transformCsvToMarkdown(csvPath: string): Promise<string> {
  try {
    const csvContent = await fs.readFile(csvPath, 'utf-8')

    // Use csv-parse for proper CSV parsing
    const records = parse(csvContent, {
      bom: true,
      relax_quotes: true,
      skip_empty_lines: true,
      trim: true,
    })

    if (records.length === 0) {
      return ''
    }

    let markdown = ''

    // Header row
    if (records[0] && Array.isArray(records[0])) {
      const headers = records[0] as string[]
      markdown += '| ' + headers.map((h) => h.replace(/\|/g, '\\|')).join(' | ') + ' |\n'
      markdown += '| ' + headers.map(() => '---').join(' | ') + ' |\n'

      // Data rows
      for (let i = 1; i < records.length; i++) {
        const row = records[i] as string[]
        markdown += '| ' + row.map((cell) => (cell || '').replace(/\|/g, '\\|')).join(' | ') + ' |\n'
      }
    }

    return markdown.trim()
  } catch (error) {
    console.error(`Error converting CSV to Markdown: ${csvPath}`, error)
    throw new Error(`Failed to convert CSV to Markdown: ${(error as Error).message}`)
  }
}
