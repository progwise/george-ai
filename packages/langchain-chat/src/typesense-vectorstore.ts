// packages/langchain-chat/src/typesense-vectorstore.ts

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import {
  Typesense,
  TypesenseConfig,
} from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { generateGeminiEmbeddings } from './gemini-embeddings'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import {
  getUnprocessedDocuments,
  setDocumentProcessed,
} from '@george-ai/pocketbase-client'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { ImportError } from 'typesense/lib/Typesense/Errors'

// Adjust chunk size/overlap as needed
const CHUNK_SIZE = 1000
const CHUNK_OVERLAP = 100

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

// We'll store everything in "gai-documents"
const typesenseSchema: CollectionCreateSchema = {
  name: 'gai-documents',
  fields: [
    { name: 'points', type: 'int32' },
    { name: 'vec', type: 'float[]', num_dim: 3072 },
    { name: 'text', type: 'string' },
    { name: 'docName', type: 'string' },
    { name: 'docType', type: 'string' },
    { name: 'docId', type: 'string' },
    // Track which embedding model was used
    { name: 'embeddingModel', type: 'string' },
  ],
  default_sorting_field: 'points',
}

const typesenseVectorStoreConfig: TypesenseConfig = {
  typesenseClient: vectorTypesenseClient,
  schemaName: 'gai-documents',
  columnNames: {
    vector: 'vec',
    pageContent: 'text',
    metadataColumnNames: [
      'points',
      'docName',
      'docType',
      'docId',
      'embeddingModel',
    ],
  },
  searchParams: {
    q: '*',
    filter_by: '',
    query_by: '',
  },
  import: async (data, collectionName) => {
    await vectorTypesenseClient
      .collections(collectionName)
      .documents()
      .import(data, { action: 'emplace', dirty_values: 'drop' })
  },
}

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-large',
  dimensions: 3072,
})

const typesenseVectorStore = new Typesense(
  embeddings,
  typesenseVectorStoreConfig,
)

// Ensure the "gai-documents" collection is created
const ensureVectorStore = async () => {
  const exists = await vectorTypesenseClient
    .collections('gai-documents')
    .exists()
  if (!exists) {
    await vectorTypesenseClient.collections().create(typesenseSchema)
    console.log('Created Typesense collection gai-documents')
  }
}

// Utility to fetch embeddings from either openai or gemini
async function getEmbeddingValues(
  text: string,
  embeddingModel: 'openai' | 'gemini',
): Promise<number[]> {
  if (embeddingModel === 'gemini') {
    return generateGeminiEmbeddings(text)
  } else {
    const openAIEmbed = new OpenAIEmbeddings({
      modelName: 'text-embedding-3-large',
      dimensions: 3072,
    })
    return openAIEmbed.embedQuery(text)
  }
}

// remove docs for given docIds
async function removeFileByDocumentIds(documentIds: string[]) {
  const promises = documentIds.map((documentId) => {
    console.log('removing file:', documentId)
    return vectorTypesenseClient
      .collections('gai-documents')
      .documents()
      .delete({ filter_by: `docId:=${documentId}` })
  })
  await Promise.all(promises)
}

// "deprecated" loader for PDF with Blob
async function loadDocumentDeprecated(document: {
  fileName: string
  url: string
  blob: Blob
  documentId: string
}) {
  console.log('deprecated loading doc as PDF:', document.fileName)
  const loader = new PDFLoader(document.blob)
  const rawDocs = await loader.load()

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  const splitted = await splitter.splitDocuments(
    rawDocs.map((d) => ({
      ...d,
      metadata: {
        docType: 'pdf',
        docName: document.fileName,
        docId: document.documentId,
      },
    })),
  )
  return splitted
}

async function loadDocuments(
  documents: {
    collectionId: string
    documentId: string
    fileName: string
    url: string
    blob: Blob
  }[],
  embeddingModel: 'openai' | 'gemini',
) {
  const splittedDocuments = []
  for (const doc of documents) {
    const loadedDoc = await loadDocumentDeprecated(doc)
    splittedDocuments.push(...loadedDoc)
  }

  // remove old docs from these docIds
  const docIds = [
    ...new Set(splittedDocuments.map((item) => item.metadata.docId)),
  ]
  console.log('removing files:', docIds)
  await removeFileByDocumentIds(docIds)

  console.log('embedding documents with', embeddingModel)

  // embed each chunk
  const embeddedDocs = []
  for (const chunk of splittedDocuments) {
    const vector = await getEmbeddingValues(chunk.pageContent, embeddingModel)
    embeddedDocs.push({
      pageContent: chunk.pageContent,
      metadata: {
        docName: chunk.metadata.docName,
        docType: chunk.metadata.docType,
        docId: chunk.metadata.docId,
        points: 1,
        embeddingModel,
      },
      vec: vector,
    })
  }

  try {
    await Typesense.fromDocuments(
      embeddedDocs,
      embeddings,
      typesenseVectorStoreConfig,
    )
    console.log('setting documents as processed:', docIds)
    await Promise.all(
      docIds.map((documentId) => setDocumentProcessed({ documentId })),
    )
  } catch (error) {
    if (error instanceof ImportError) {
      console.error(
        'Error loading documents:',
        JSON.stringify(error.importResults, null, 2),
      )
    } else {
      console.error('Error loading documents:', error)
    }
  }
}

// track how many times we've processed
let processing = 0

/**
 * loadUprocessedDocumentsIntoVectorStore => used by processUnprocessedDocuments()
 * in index.ts, can pick openai or gemini
 */
export const loadUprocessedDocumentsIntoVectorStore = async (
  embeddingModel: 'openai' | 'gemini' = 'openai',
) => {
  console.log('processing iteration:', processing++)
  await ensureVectorStore()

  const documents = await getUnprocessedDocuments()
  console.log(
    'unprocessed documents:',
    documents.map((d) => d.fileName),
  )

  await loadDocuments(documents, embeddingModel)
}

// Let your chain do a similaritySearch with openai embeddings
export const getPDFContentForQuestion = async (question: string) => {
  await ensureVectorStore()
  try {
    console.log('searching for:', question)
    const docs = await typesenseVectorStore.similaritySearch(question)
    console.log('retrieved documents:', docs)
    return docs.map((d) => d.pageContent).join('\n\n')
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}

/**
 * EXAMPLE: Drop the entire "gai-documents" collection
 */
export const dropVectorStore = async () => {
  const exists = await vectorTypesenseClient
    .collections('gai-documents')
    .exists()
  if (exists) {
    await vectorTypesenseClient.collections('gai-documents').delete()
    console.log('Dropped vector store gai-documents')
  }
}

/**
 * EXAMPLE: remove all docs for a single file
 */
export const dropFile = async (fileId: string) => {
  await ensureVectorStore()
  await vectorTypesenseClient
    .collections('gai-documents')
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })

  console.log(`Dropped docs for file ID: ${fileId}`)
}

/**
 * EXAMPLE: embed a single file
 * (maybe you don't use it. But if your code or pothos-graphql references it, define it.)
 */
export const embedFile = async (file: {
  id: string
  name: string
  originUri: string
  mimeType: string
  path: string
}) => {
  console.log('Stub embedFile: do something or remove if not used.')
  // Possibly replicate a logic:
  // 1) ensureVectorStore
  // 2) chunk the file
  // 3) embed with openai or gemini
  // ...
  console.log(`embedFile called for file: ${file.name}`)
}
