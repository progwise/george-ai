import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_PATH = path.resolve(__dirname, '../data', 'mag_example1.pdf')

// Parameter settings
const MIN_CHUNK_SIZE = 500
const MAX_CHUNK_SIZE = 2000
const OVERLAP_RATIO = 0.1
const LINEAR_RETRIEVAL_THRESHOLD = 10

let memoryVectorStore: MemoryVectorStore | null = null
let totalChunkCount = 0

const getPDFVectorStore = async () => {
  if (memoryVectorStore) {
    return memoryVectorStore
  }
  console.log('Loading PDF document...')
  const loader = new PDFLoader(DATA_PATH)
  const rawDocuments = await loader.load()
  console.log(`Loaded ${rawDocuments.length} pages from PDF`)

  const calculateChunkParameters = (
    minSize: number,
    maxSize: number,
    overlapRatio: number,
    documents: { pageContent: string }[],
  ) => {
    const totalLength = documents.reduce((sum, doc) => sum + doc.pageContent.length, 0)
    const avgLength = totalLength / documents.length
    const chunkSize = Math.round(Math.min(maxSize, Math.max(minSize, avgLength)))
    const chunkOverlap = Math.round(chunkSize * overlapRatio)
    return { chunkSize, chunkOverlap }
  }

  const { chunkSize, chunkOverlap } = calculateChunkParameters(
    MIN_CHUNK_SIZE,
    MAX_CHUNK_SIZE,
    OVERLAP_RATIO,
    rawDocuments,
  )

  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
  const splitDocuments = await splitter.splitDocuments(rawDocuments)
  console.log(`Split into ${splitDocuments.length} chunks (chunkSize=${chunkSize}, chunkOverlap=${chunkOverlap})`)

  totalChunkCount = splitDocuments.length
  const embeddings = new OpenAIEmbeddings()
  memoryVectorStore = await MemoryVectorStore.fromDocuments(splitDocuments, embeddings)
  return memoryVectorStore
}

export const getPDFContentForQuestion = async (question: string) => {
  try {
    const vectorStore = await getPDFVectorStore()
    const k = totalChunkCount <= LINEAR_RETRIEVAL_THRESHOLD ? totalChunkCount : Math.ceil(Math.sqrt(totalChunkCount))
    const retriever = vectorStore.asRetriever(k)
    const docs = await retriever.invoke(question)
    return docs.map((document_) => document_.pageContent).join('\n\n')
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}
