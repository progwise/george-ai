import { Element, Root, RootContent } from 'hast'
import rehypeSanitize from 'rehype-sanitize'
import rehypeStringify from 'rehype-stringify'
import remarkGfm from 'remark-gfm'
import remarkParse from 'remark-parse'
import remarkRehype from 'remark-rehype'
import { unified } from 'unified'

import { ExtractionMethod } from '../../../gql/graphql'

// Custom plugin to rewrite image URLs
const rewriteAttachmentPaths = (parameters: {
  libraryId: string
  documentId: string
  extractionMethod: ExtractionMethod
  backendPublicUrl: string
}) => {
  const { libraryId, documentId, extractionMethod, backendPublicUrl } = parameters
  return (tree: Root) => {
    // Recursive walker function
    const walk = (node: Root | RootContent) => {
      // 1. Check if the node is an Element and specifically an <img>
      if (node.type === 'element' && node.tagName === 'img') {
        const element = node as Element // Cast to access properties safely

        if (element.properties && typeof element.properties.src === 'string') {
          const originalSrc = element.properties.src

          const match = originalSrc.match(/^attachments\/(.+)$/)
          if (match) {
            const attachmentFileName = match[1]
            element.properties.src = `${backendPublicUrl}/library-files/${libraryId}/${documentId}?extraction=${extractionMethod}&attachment=${encodeURIComponent(attachmentFileName)}`
          }
        }
      }

      // 3. Recursively walk through children
      if ('children' in node && Array.isArray(node.children)) {
        node.children.forEach(walk)
      }
    }

    walk(tree)
  }
}

export const convertExtractionMarkdownToHtml = (parameters: {
  documentId: string
  libraryId: string
  markdown: string
  extractionMethod: ExtractionMethod
  backendPublicUrl: string
}) => {
  const { markdown } = parameters
  const html = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(rewriteAttachmentPaths, parameters) // Apply the custom plugin to rewrite attachment URLs
    .use(rehypeSanitize) // Sanitize HTML to prevent XSS
    .use(rehypeStringify)
    .processSync(markdown || '')
    .toString()
  return html
}
