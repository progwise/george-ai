import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildSplitter, chooseK } from './vec-utils'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const DATA_PATH = path.resolve(__dirname, '../data/mag_example1.pdf')

let memoryVectorStore: MemoryVectorStore | null = null
let splitCount = 0

async function getPDFVectorStore() {
  if (memoryVectorStore) return memoryVectorStore

  const loader = new PDFLoader(DATA_PATH)
  const rawDocs = await loader.load()
  const fullText = rawDocs.map((d) => d.pageContent).join('\n')
  const splitter = buildSplitter(fullText)
  const splitDocs = await splitter.splitDocuments(rawDocs)
  splitCount = splitDocs.length

  const embeddings = new OpenAIEmbeddings()
  memoryVectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)
  return memoryVectorStore
}

export const getPDFContentForQuestion = async (question: string) => {
  const vs = await getPDFVectorStore()
  // pick k and whether it's a list query
  const { k, listLike } = chooseK(question, splitCount)
  // note: MemoryVectorStore.asRetriever accepts only k and searchType
  const retriever = vs.asRetriever({
    k,
    searchType: listLike ? 'mmr' : 'similarity',
  })
  const docs = await retriever.invoke(question)
  return docs.map((d) => d.pageContent).join('\n\n')
}
