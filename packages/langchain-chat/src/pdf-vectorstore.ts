import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_PATH = path.resolve(__dirname, '../data', 'mag_example1.pdf') // Path to the PDF document
const CHUNK_SIZE = 1000 // Increased for better context
const CHUNK_OVERLAP = 100

let pdfVectorStore: MemoryVectorStore | null

export const getPDFVectorStore = async () => {
  if (pdfVectorStore) {
    return pdfVectorStore
  }
  // Load and process documents
  console.log('Loading PDF document...')
  const loader = new PDFLoader(DATA_PATH)
  const rawDocuments = await loader.load()
  // console.log(rawDocuments)
  console.log(`Loaded ${rawDocuments.length} pages from PDF`)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  const splitDocuments = await splitter.splitDocuments(rawDocuments)
  console.log(`Split into ${splitDocuments.length} chunks`)
  const embeddings = new OpenAIEmbeddings()
  pdfVectorStore = await MemoryVectorStore.fromDocuments(
    splitDocuments,
    embeddings,
  )
  return pdfVectorStore
}
