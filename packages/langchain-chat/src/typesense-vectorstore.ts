import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import {
  Typesense,
  TypesenseConfig,
} from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Client } from 'typesense'
import { Document } from '@langchain/core/documents'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const DATA_PATH = path.resolve(__dirname, '../data', 'mag_example1.pdf') // Path to the PDF document
const CHUNK_SIZE = 1000 // Increased for better context
const CHUNK_OVERLAP = 100
const LOCAL_RETRIEVAL_K = 4

const vectorTypesenseClient = new Client({
  nodes: [
    {
      // Ideally should come from your .env file
      host: process.env.TYPESENSE_API_HOST || 'gai-typesense',
      port: Number.parseInt(process.env.TYPESENSE_API_PORT || '8108'),
      protocol: process.env.TYPESENSE_API_PROTOCOL || 'http',
    },
  ],
  // Ideally should come from your .env file
  apiKey: 'xyz',
  numRetries: 3,
  connectionTimeoutSeconds: 60,
})

vectorTypesenseClient.debug

/*
curl --location 'http://localhost:8108/collections' \
--header 'Content-Type: application/json' \
--header 'X-TYPESENSE-API-KEY: xyz' \
--data '{
         "name": "gai-documents",
         "fields": [
            { "name": "points", "type": "int32"},
           {"name": "vec", "type": "float[]", "num_dim": 3072 },
           {"name": "text", "type": "string" },
           {"name": "docName", "type": "string" },
					 {"name": "docType", "type": "string" }
         ],
         "default_sorting_field": "points"
       }'
*/

/*
  curl --location --request DELETE 'http://localhost:8108/collections/gai-documents' \
  --header 'X-TYPESENSE-API-KEY: xyz'
*/

const typesenseVectorStoreConfig = {
  // Typesense client
  typesenseClient: vectorTypesenseClient,
  // Name of the collection to store the vectors in
  schemaName: 'gai-documents',
  // Optional column names to be used in Typesense
  columnNames: {
    // "vec" is the default name for the vector column in Typesense but you can change it to whatever you want
    vector: 'vec',
    // "text" is the default name for the text column in Typesense but you can change it to whatever you want
    pageContent: 'text',
    // Names of the columns that you will save in your typesense schema and need to be retrieved as metadata when searching
    metadataColumnNames: ['points', 'docName', 'docType'],
  },

  // Optional search parameters to be passed to Typesense when searching
  searchParams: {
    q: '*',
    filter_by: '',
    query_by: '',
  },
  // You can override the default Typesense import function if you want to do something more complex
  // Default import function:
  // async importToTypesense<
  //   T extends Record<string, unknown> = Record<string, unknown>
  // >(data: T[], collectionName: string) {
  //   const chunkSize = 2000;
  //   for (let i = 0; i < data.length; i += chunkSize) {
  //     const chunk = data.slice(i, i + chunkSize);

  //     await this.caller.call(async () => {
  //       await this.client
  //         .collections<T>(collectionName)
  //         .documents()
  //         .import(chunk, { action: "emplace", dirty_values: "drop" });
  //     });
  //   }
  // }
  import: async (data, collectionName) => {
    await vectorTypesenseClient
      .collections(collectionName)
      .documents()
      .import(data, { action: 'emplace', dirty_values: 'drop' })
  },
} satisfies TypesenseConfig

let typesenseVectorStore: Typesense | null

const getTypesenseVectorStore = async () => {
  if (typesenseVectorStore) {
    return typesenseVectorStore
  }
  const loader = new PDFLoader(DATA_PATH)
  const rawDocuments = await loader.load()
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  const splitDocuments = await splitter.splitDocuments(
    rawDocuments.map((document) => ({
      ...document,
      metadata: {
        docType: 'pdf',
        docName: 'mag_example1.pdf',
        points: 1,
      },
    })),
  )
  const embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-large',
    dimensions: 3072,
  })
  typesenseVectorStore = await Typesense.fromDocuments(
    splitDocuments,
    embeddings,
    typesenseVectorStoreConfig,
  )
  return typesenseVectorStore
}

// retrieves related vectors from the local PDF content
export const getPDFContentForQuestion = async (question: string) => {
  try {
    const vectorStore = await getTypesenseVectorStore()
    console.log('searching for:', question)
    const documents = await vectorStore.similaritySearch(question)
    console.log('found ts content:', documents)
    const content = documents
      .map((document_) => document_.pageContent)
      .join('\n\n')

    return content
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}
