import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

const DATA_PATH = '../data/mag_example1.pdf'

const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 100
const LOCAL_RETRIEVAL_K = 4

let memoryVectorStore: MemoryVectorStore | null

export const getPDFVectorStore = async () => {
  if (memoryVectorStore) {
    return memoryVectorStore
  }
  console.log('Loading PDF document from:', DATA_PATH)

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
  memoryVectorStore = await MemoryVectorStore.fromDocuments(
    splitDocuments,
    embeddings,
  )
  return memoryVectorStore
}

export const getPDFContentForQuestion = async (question: string) => {
  try {
    const vectorStore = await getPDFVectorStore()
    const retrieverLocal = vectorStore.asRetriever(LOCAL_RETRIEVAL_K)
    const documents = await retrieverLocal.invoke(question)

    return documents.map((d) => d.pageContent).join('\n\n')
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}
