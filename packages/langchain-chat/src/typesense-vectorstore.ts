import { Typesense, TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

import { getUnprocessedDocuments, setDocumentProcessed } from '@george-ai/pocketbase-client'

import { loadFile } from './langchain-file'
import { DEFAULT_ADAPTIVE_CONFIG, calculateChunkParams, calculateRetrievalK } from './vectorstore-settings'

const cfg = DEFAULT_ADAPTIVE_CONFIG
const vectorClient = new Client({
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

const getSchemaName = (lib: string): string => `gai-library-${lib}`
const getSchema = (lib: string): CollectionCreateSchema => ({
  name: getSchemaName(lib),
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

const getConfig = (lib: string): TypesenseConfig => ({
  typesenseClient: vectorClient,
  schemaName: getSchemaName(lib),
  columnNames: { vector: 'vec', pageContent: 'text', metadataColumnNames: ['points', 'docName', 'docType', 'docId'] },
  searchParams: { q: '*', filter_by: '', query_by: 'text' },
  import: async <T extends Record<string, unknown>>(data: T[], collectionName: string) => {
    await vectorClient.collections(collectionName).documents().import(data, { action: 'emplace', dirty_values: 'drop' })
  },
})

const embeddings = new OpenAIEmbeddings({ modelName: 'text-embedding-3-large', dimensions: cfg.embeddingDimensions })

export const ensureVectorStore = async (lib: string): Promise<void> => {
  const name = getSchemaName(lib)
  if (!(await vectorClient.collections(name).exists())) {
    await vectorClient.collections().create(getSchema(lib))
  }
}

export const dropVectorStore = async (lib: string): Promise<void> => {
  const name = getSchemaName(lib)
  if (await vectorClient.collections(name).exists()) {
    await vectorClient.collections(name).delete()
  }
}

export const dropFileFromVectorstore = async (lib: string, fileId: string): Promise<void> => {
  await ensureVectorStore(lib)
  await vectorClient
    .collections(getSchemaName(lib))
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
  await Typesense.fromDocuments(splitDocs, embeddings, getConfig(lib))
  return { id: file.id, name: file.name, originUri: file.originUri, mimeType: file.mimeType, chunks: splitDocs.length }
}

export const similaritySearch = async (
  question: string,
  lib: string,
): Promise<{ pageContent: string; docName: string }[]> => {
  await ensureVectorStore(lib)
  const { found } = await vectorClient
    .collections(getSchemaName(lib))
    .documents()
    .search({ q: '*', query_by: 'text', per_page: 1 })
  const k = calculateRetrievalK(found, cfg)
  const store = new Typesense(embeddings, getConfig(lib))
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
