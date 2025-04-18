import { Typesense, TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

import { getUnprocessedDocuments, setDocumentProcessed } from '@george-ai/pocketbase-client'

import { loadFile } from './langchain-file'

// Parameter settings
const MIN_CHUNK_SIZE = 500
const MAX_CHUNK_SIZE = 2000
const OVERLAP_RATIO = 0.1

const vectorTypesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_API_HOST || 'gai-typesense',
      port: Number.parseInt(process.env.TYPESENSE_API_PORT || '8108'),
      protocol: process.env.TYPESENSE_API_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  numRetries: 3,
  connectionTimeoutSeconds: 60,
})

const getTypesenseSchemaName = (libraryId: string) => `gai-library-${libraryId}`

const getTypesenseSchema = (libraryId: string): CollectionCreateSchema => ({
  name: getTypesenseSchemaName(libraryId),
  fields: [
    { name: 'points', type: 'int32' },
    { name: 'vec', type: 'float[]', num_dim: 3072 },
    { name: 'text', type: 'string' },
    { name: 'docName', type: 'string' },
    { name: 'docType', type: 'string' },
    { name: 'docId', type: 'string' },
  ],
  default_sorting_field: 'points',
})

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
					 {"name": "docType", "type": "string" },
           { name: 'docId', type: 'string' },
         ],
         "default_sorting_field": "points"
       }'
*/

/*
  curl --location --request DELETE 'http://localhost:8108/collections/gai-documents' \
  --header 'X-TYPESENSE-API-KEY: xyz'
*/

const getTypesenseVectorStoreConfig = (libraryId: string): TypesenseConfig => ({
  typesenseClient: vectorTypesenseClient,
  schemaName: getTypesenseSchemaName(libraryId),
  columnNames: { vector: 'vec', pageContent: 'text', metadataColumnNames: ['points', 'docName', 'docType', 'docId'] },
  searchParams: { q: '*', filter_by: '', query_by: 'text' },
  import: async <T extends Record<string, unknown>>(data: T[], collectionName: string): Promise<void> => {
    await vectorTypesenseClient
      .collections(collectionName)
      .documents()
      .import(data, { action: 'emplace', dirty_values: 'drop' })
  },
})

const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large', dimensions: 3072 })

export const ensureVectorStore = async (libraryId: string): Promise<void> => {
  const name = getTypesenseSchemaName(libraryId)
  if (!(await vectorTypesenseClient.collections(name).exists())) {
    await vectorTypesenseClient.collections().create(getTypesenseSchema(libraryId))
  }
}

export const dropVectorStore = async (libraryId: string): Promise<void> => {
  const name = getTypesenseSchemaName(libraryId)
  if (await vectorTypesenseClient.collections(name).exists()) {
    await vectorTypesenseClient.collections(name).delete()
  }
}

export const dropFileFromVectorstore = async (libraryId: string, fileId: string): Promise<void> => {
  const name = getTypesenseSchemaName(libraryId)
  await ensureVectorStore(libraryId)
  await vectorTypesenseClient
    .collections(name)
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })
}

export const embedFile = async (
  libraryId: string,
  file: { id: string; name: string; originUri: string; mimeType: string; path: string },
): Promise<{ id: string; name: string; originUri: string; mimeType: string; chunks: number; size: number }> => {
  await ensureVectorStore(libraryId)
  const parts = await loadFile(file)
  const totalLength = parts.reduce((sum, p) => sum + p.pageContent.length, 0)
  const avgLength = totalLength / parts.length
  const chunkSize = Math.round(Math.min(MAX_CHUNK_SIZE, Math.max(MIN_CHUNK_SIZE, avgLength)))
  const chunkOverlap = Math.round(chunkSize * OVERLAP_RATIO)
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
  const splitDocs = await splitter.splitDocuments(parts)
  await Typesense.fromDocuments(splitDocs, embeddings, getTypesenseVectorStoreConfig(libraryId))
  return {
    id: file.id,
    name: file.name,
    originUri: file.originUri,
    mimeType: file.mimeType,
    chunks: splitDocs.length,
    size: totalLength,
  }
}

export const similaritySearch = async (
  question: string,
  libraryId: string,
): Promise<{ pageContent: string; docName: string }[]> => {
  await ensureVectorStore(libraryId)
  const { found } = await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .search({ q: '*', query_by: 'text', per_page: 1 })
  const k = found <= 10 ? found : Math.ceil(Math.sqrt(found))
  const store = new Typesense(embeddings, getTypesenseVectorStoreConfig(libraryId))
  const docs = await store.similaritySearch(question, k)
  return docs.map((d) => ({ pageContent: d.pageContent, docName: d.metadata.docName.toString() }))
}

export const getPDFContentForQuestion = async (question: string): Promise<string> => {
  const docs = await similaritySearch(question, 'common')
  return docs.map((d) => d.pageContent).join('\n\n')
}

export const loadUnprocessedDocumentsIntoVectorStore = async (): Promise<void> => {
  await ensureVectorStore('common')
  const docs = await getUnprocessedDocuments()
  await Promise.all(
    docs.map((d) =>
      embedFile('common', {
        id: d.documentId,
        name: d.fileName,
        originUri: d.url,
        mimeType: (d.blob as Blob).type || 'application/pdf',
        path: '',
      }),
    ),
  )
  await Promise.all(docs.map((d) => setDocumentProcessed({ documentId: d.documentId })))
}

export { loadUnprocessedDocumentsIntoVectorStore as loadUprocessedDocumentsIntoVectorStore }
