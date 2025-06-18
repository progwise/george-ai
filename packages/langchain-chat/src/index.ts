import * as mainChain from './main-chain'
import { RetrievalFlow } from './retrieval-flow'

export * from './retrieval-flow'

export * from './assistant-chain'

export const ask = (parameters: { question: string; sessionId: string; retrievalFlow: RetrievalFlow }) =>
  mainChain.historyChain.invoke(
    { question: parameters.question },
    {
      configurable: {
        sessionId: parameters.sessionId,
        retrievalFlow: parameters.retrievalFlow,
      },
    },
  )

export * from './typesense-vectorstore'
export { getPDFContentForQuestion, getPDFContentForQuestionAndLibraries } from './typesense-vectorstore'
export { getWebContent } from './web-vectorstore'
export { calculateChunkParams, MAX_CHUNK_SIZE, MIN_CHUNK_SIZE, OVERLAP_RATIO } from './vectorstore-settings'
export {
  convertPdfToMarkdown,
  convertDocxToMarkdown,
  convertCsvToMarkdown,
  convertExcelToMarkdown,
  convertDocumentsToMarkdown,
  loadFile,
  type FileLoadParams,
} from './file-converter'
