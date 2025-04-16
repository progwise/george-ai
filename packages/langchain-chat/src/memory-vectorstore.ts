import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_PATH = path.resolve(__dirname, '../data', 'mag_example1.pdf')
const CHUNK_SIZE = 700
const CHUNK_OVERLAP = 150
const LOCAL_RETRIEVAL_K = 10

let memoryVectorStore: MemoryVectorStore | null

const getPDFVectorStore = async () => {
  if (memoryVectorStore) {
    return memoryVectorStore
  }
  console.log('Loading PDF document...')
  const loader = new PDFLoader(DATA_PATH)
  const rawDocuments = await loader.load()
  console.log(`Loaded ${rawDocuments.length} pages from PDF`)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  const splitDocuments = await splitter.splitDocuments(rawDocuments)
  console.log(`Split into ${splitDocuments.length} chunks`)
  const embeddings = new OpenAIEmbeddings()
  memoryVectorStore = await MemoryVectorStore.fromDocuments(splitDocuments, embeddings)
  return memoryVectorStore
}

export const getPDFContentForQuestion = async (question: string) => {
  try {
    const vectorStore = await getPDFVectorStore()
    const retrieverLocal = vectorStore.asRetriever(LOCAL_RETRIEVAL_K)
    const documents = await retrieverLocal.invoke(question)
    const content = documents.map((document_) => document_.pageContent).join('\n\n')
    return content
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}
