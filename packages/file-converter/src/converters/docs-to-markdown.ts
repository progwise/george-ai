import mammoth from 'mammoth'

export async function transformDocxToMarkdown(docxPath: string): Promise<string> {
  try {
    // @ts-expect-error - convertToMarkdown exists but not in type definitions
    const result = await mammoth.convertToMarkdown({ path: docxPath })
    return result.value.trim()
  } catch (error) {
    console.error(`Error converting DOCX to Markdown: ${docxPath}`, error)
    throw new Error(`Failed to convert DOCX to Markdown: ${(error as Error).message}`)
  }
}
