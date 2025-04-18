import { Typesense } from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Client } from 'typesense'
import type { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'

import { getUnprocessedDocuments, setDocumentProcessed } from '@george-ai/pocketbase-client'

import { loadFile } from './langchain-file'

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-large',
  dimensions: 3072,
})
const typesenseClient = new Client({
  nodes: [
    {
      host: process.env.TYPESENSE_API_HOST || 'gai-typesense',
      port: Number.parseInt(process.env.TYPESENSE_API_PORT || '8108'),
      protocol: process.env.TYPESENSE_API_PROTOCOL || 'http',
    },
  ],
  apiKey: process.env.TYPESENSE_API_KEY || 'xyz',
  numRetries: 3,
})

function schemaName(libraryId: string) {
  return `gai-library-${libraryId}`
}
function schemaDef(libraryId: string): CollectionCreateSchema {
  return {
    name: schemaName(libraryId),
    fields: [
      { name: 'points', type: 'int32' },
      { name: 'vec', type: 'float[]', num_dim: 3072 },
      { name: 'text', type: 'string' },
      { name: 'docName', type: 'string' },
      { name: 'docType', type: 'string' },
      { name: 'docId', type: 'string' },
    ],
    default_sorting_field: 'points',
  }
}

async function ensureStore(libraryId: string) {
  const name = schemaName(libraryId)
  if (!(await typesenseClient.collections(name).exists())) {
    await typesenseClient.collections().create(schemaDef(libraryId))
  }
}

export const embedFile = async (
  libraryId: string,
  file: { id: string; name: string; originUri: string; mimeType: string; path: string },
) => {
  await ensureStore(libraryId)
  const parts = await loadFile(file)
  // we could buildSplitter here too if you like
  await Typesense.fromDocuments(parts, embeddings, {
    typesenseClient,
    schemaName: schemaName(libraryId),
    columnNames: {
      vector: 'vec',
      pageContent: 'text',
      metadataColumnNames: ['points', 'docName', 'docType', 'docId'],
    },
  })
}

export const similaritySearch = async (question: string, libraryId: string, kOverride?: number) => {
  await ensureStore(libraryId)
  const store = new Typesense(embeddings, {
    typesenseClient,
    schemaName: schemaName(libraryId),
    columnNames: {
      vector: 'vec',
      pageContent: 'text',
      metadataColumnNames: ['points', 'docName', 'docType', 'docId'],
    },
  })
  const k = kOverride ?? 4
  const docs = await store.similaritySearch(question, k)
  return docs.map((d) => ({
    pageContent: d.pageContent,
    docName: d.metadata.docName.toString(),
  }))
}

export const loadUprocessedDocumentsIntoVectorStore = async () => {
  const un = await getUnprocessedDocuments()
  for (const doc of un) {
    // getUnprocessedDocuments() returns { collectionId, documentId, fileName, url, blob }
    await embedFile(doc.collectionId, {
      id: doc.documentId,
      name: doc.fileName,
      originUri: doc.url,
      mimeType: 'application/pdf', // or derive from fileName extension
      path: doc.url, // use the URL as a temporary path
    })
    await setDocumentProcessed({ documentId: doc.documentId })
  }
}
