import { Typesense, TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

import { getUnprocessedDocuments, setDocumentProcessed } from '@george-ai/pocketbase-client'

import { loadFile } from './langchain-file'
import { DEFAULT_ADAPTIVE_CONFIG, calculateChunkParams, calculateRetrievalK } from './vectorstore-settings'

const cfg = DEFAULT_ADAPTIVE_CONFIG
const vectorTypesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_API_HOST || 'gai-typesense',
      port: parseInt(process.env.TYPESENSE_API_PORT || '8108'),
      protocol: process.env.TYPESENSE_API_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  numRetries: cfg.typesenseNumRetries,
  connectionTimeoutSeconds: cfg.typesenseConnectionTimeout,
})

const getTypesenseSchemaName = (libraryId: string) => `gai-library-${libraryId}`

const getTypesenseSchema = (libraryId: string): CollectionCreateSchema => ({
  name: getTypesenseSchemaName(libraryId),
  fields: [
    { name: 'points', type: 'int32' },
    { name: 'vec', type: 'float[]', num_dim: cfg.embeddingDimensions },
    { name: 'text', type: 'string' },
    { name: 'docName', type: 'string' },
    { name: 'docType', type: 'string' },
    { name: 'docId', type: 'string' },
  ],
  default_sorting_field: 'points',
})

const getTypesenseVectorStoreConfig = (libraryId: string): TypesenseConfig => ({
  typesenseClient: vectorTypesenseClient,
  schemaName: getTypesenseSchemaName(libraryId),
  columnNames: {
    vector: 'vec',
    pageContent: 'text',
    metadataColumnNames: ['points', 'docName', 'docType', 'docId'],
  },

  // Optional search parameters to be passed to Typesense when searching
  searchParams: {
    q: '*',
    filter_by: '',
    query_by: '',
  },
  import: async <T extends Record<string, unknown>>(data: T[], collectionName: string) => {
    await vectorTypesenseClient
      .collections(collectionName)
      .documents()
      .import(data, { action: 'emplace', dirty_values: 'drop' })
  },
})

const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large', dimensions: cfg.embeddingDimensions })

export const ensureVectorStore = async (libraryId: string): Promise<void> => {
  const schemaName = getTypesenseSchemaName(libraryId)
  const exists = await vectorTypesenseClient.collections(schemaName).exists()
  if (!exists) {
    await vectorTypesenseClient.collections().create(getTypesenseSchema(libraryId))
  }
}

export const dropVectorStore = async (libraryId: string): Promise<void> => {
  const schemaName = getTypesenseSchemaName(libraryId)
  const exists = await vectorTypesenseClient.collections(schemaName).exists()
  if (exists) {
    await vectorTypesenseClient.collections(schemaName).delete()
  }
}

export const dropFileFromVectorstore = async (libraryId: string, fileId: string): Promise<void> => {
  await ensureVectorStore(libraryId)
  await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })
}

export const embedFile = async (
  lib: string,
  file: { id: string; name: string; originUri: string; mimeType: string; path: string },
): Promise<{ id: string; name: string; originUri: string; mimeType: string; chunks: number }> => {
  await ensureVectorStore(lib)
  const parts = await loadFile(file)
  const { chunkSize, chunkOverlap } = calculateChunkParams(parts, cfg)
  const splitter = new RecursiveCharacterTextSplitter({ chunkSize, chunkOverlap })
  const splitDocs = await splitter.splitDocuments(parts)
  await Typesense.fromDocuments(splitDocs, embeddings, getTypesenseVectorStoreConfig(lib))
  return { id: file.id, name: file.name, originUri: file.originUri, mimeType: file.mimeType, chunks: splitDocs.length }
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
  const k = calculateRetrievalK(found, cfg)
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
