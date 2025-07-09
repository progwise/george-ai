import { Document } from 'langchain/document'
import fs from 'node:fs'

/**
This splits a markdownfile into multiple chunks based on the semantics of the markdown content.
 */
export const splitMarkdown = (
  markdownFilePath: string,
  options: {
    metadata: {
      docType: 'markdown'
      docName: string
      points: 1
      docId: string
      docPath: string
      originUri: string
    }
  },
): Document[] => {
  const documents: Array<Document> = []

  const content = fs.readFileSync(markdownFilePath, 'utf-8')

  // TODO: Implement a more sophisticated splitting logic based on markdown structure
  documents.push(
    new Document({
      pageContent: content,
      metadata: {
        ...options.metadata,
      },
    }),
  )

  return documents
}
