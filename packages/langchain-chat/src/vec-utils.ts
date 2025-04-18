import { MarkdownTextSplitter, RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

// packages/langchain-chat/src/utils/vec-utils.ts

/**
 * Estimate tokens by character count (≈4 chars per token).
 */
export function getDocStats(text: string) {
  return {
    tokens: Math.max(1, Math.ceil(text.length / 4)),
    headings: (text.match(/^#{1,6}\s/gm) || []).length,
  }
}

/**
 * Build a text splitter: headings-based if 3+ headings, else size-based.
 */
export function buildSplitter(markdown: string) {
  const stats = getDocStats(markdown)
  if (stats.headings >= 3) {
    return new MarkdownTextSplitter()
  }
  const chunkSize = stats.tokens < 2000 ? stats.tokens : stats.tokens < 8000 ? 512 : 1024
  return new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap: Math.floor(chunkSize / 10),
  })
}

/**
 * Choose k and listLike for a query.
 */
export function chooseK(question: string, numChunks: number): { k: number; listLike: boolean } {
  const listLike = /(?:list|name|who|which|give me|show)\b/i.test(question)
  const raw = Math.ceil(numChunks * 0.25)
  const k = Math.max(4, Math.min(10, raw))
  return { k, listLike }
}
