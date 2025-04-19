import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { DEFAULT_ADAPTIVE_CONFIG, calculateChunkParams, calculateRetrievalK } from './vectorstore-settings'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.resolve(__dirname, '../data', 'mag_example1.pdf')

let memoryVectorStore: MemoryVectorStore | null = null
let lastChunkCount = 0

export const getPDFVectorStore = async (): Promise<MemoryVectorStore> => {
  if (memoryVectorStore) return memoryVectorStore
  const loader = new PDFLoader(DATA_PATH)
  const rawDocs = await loader.load()
  const { chunkSize, chunkOverlap } = calculateChunkParams(rawDocs, DEFAULT_ADAPTIVE_CONFIG)
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
  const splitDocs = await splitter.splitDocuments(rawDocs)
  lastChunkCount = splitDocs.length
  const embeddings = new OpenAIEmbeddings()
  memoryVectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)
  return memoryVectorStore
}

export const getPDFContentForQuestion = async (question: string): Promise<string> => {
  try {
    const store = await getPDFVectorStore()
    const k = calculateRetrievalK(lastChunkCount, DEFAULT_ADAPTIVE_CONFIG)
    const retriever = store.asRetriever(k)
    const docs = await retriever.invoke(question)
    return docs.map((d) => d.pageContent).join('\n\n')
  } catch {
    return ''
  }
}
