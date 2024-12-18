import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import {
  Typesense,
  TypesenseConfig,
} from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import {
  getUnprocessedDocuments,
  setDocumentProcessed,
} from '@george-ai/pocketbase-client'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { ImportError } from 'typesense/lib/Typesense/Errors'

const CHUNK_SIZE = 1000 // Increased for better context
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

const typesenseSchema = {
  name: 'gai-documents',
  fields: [
    { name: 'points', type: 'int32' },
    { name: 'vec', type: 'float[]', num_dim: 3072 },
    { name: 'text', type: 'string' },
    { name: 'docName', type: 'string' },
    { name: 'docType', type: 'string' },
    { name: 'docId', type: 'string' },
  ],
  default_sorting_field: 'points',
} satisfies CollectionCreateSchema

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

const typesenseVectorStoreConfig = {
  typesenseClient: vectorTypesenseClient,
  schemaName: 'gai-documents',
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
  import: async (data, collectionName) => {
    await vectorTypesenseClient
      .collections(collectionName)
      .documents()
      .import(data, { action: 'emplace', dirty_values: 'drop' })
  },
} satisfies TypesenseConfig

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-large',
  dimensions: 3072,
})

const typesenseVectorStore = new Typesense(
  embeddings,
  typesenseVectorStoreConfig,
)

const ensureVectorStore = async () => {
  const exists = await vectorTypesenseClient
    .collections('gai-documents')
    .exists()
  if (!exists) {
    await vectorTypesenseClient.collections().create(typesenseSchema)
  }
}

const loadDocument = async (document: {
  fileName: string
  url: string
  blob: Blob
  documentId: string
}) => {
  console.log('loading document:', document.fileName)
  const loader = new PDFLoader(document.blob)
  const rawDocuments = await loader.load()
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  const splitDocuments = await splitter.splitDocuments(
    rawDocuments.map((d) => ({
      ...d,
      metadata: {
        docType: 'pdf',
        docName: document.fileName,
        points: 1,
        docId: document.documentId,
      },
    })),
  )
  return splitDocuments
}

const removeFilesByDocumentIds = async (documentIds: string[]) => {
  const promises = documentIds.map((documentId) => {
    console.log('removing file:', documentId)
    return vectorTypesenseClient
      .collections('gai-documents')
      .documents()
      .delete({ filter_by: `docId:=${documentId}` })
  })
  await Promise.all(promises)
}

const loadDocuments = async (
  documents: {
    collectionId: string
    documentId: string
    fileName: string
    url: string
    blob: Blob
  }[],
) => {
  const splitDocuments = await Promise.all(
    documents.map(async (document) => {
      const loadedDocument = await loadDocument({
        fileName: document.fileName,
        url: document.url,
        blob: document.blob,
        documentId: document.documentId,
      })
      return loadedDocument
    }),
  )
  splitDocuments.map(async (splitDocument) => {
    const documentIds = [
      ...new Set(splitDocument.map((document) => document.metadata.docId)),
    ]
    console.log('removing files:', documentIds)
    await removeFilesByDocumentIds(documentIds)
    console.log(
      'loading documents:',
      JSON.stringify(splitDocument, undefined, 2),
    )
    try {
      await Typesense.fromDocuments(
        splitDocument,
        embeddings,
        typesenseVectorStoreConfig,
      )

      const documentIds = [
        ...new Set(splitDocument.map((document) => document.metadata.docId)),
      ]

      console.log('setting documents as processed:', documentIds)

      await Promise.all(
        documentIds.map((documentId) => setDocumentProcessed({ documentId })),
      )
    } catch (error) {
      if (error instanceof ImportError) {
        console.error(
          'Error loading documents:',
          JSON.stringify(error.importResults, undefined, 2),
        )
      } else {
        console.error('Error loading documents:', error)
      }
    }
  })
}

let processing = 0

export const loadUprocessedDocumentsIntoVectorStore = async () => {
  console.log('processing:', processing++)
  await ensureVectorStore()
  const documents = await getUnprocessedDocuments()
  console.log(
    'unprocessed documents:',
    documents.map((d) => d.fileName),
  )
  await loadDocuments(documents)
}

// retrieves content from the vector store similar to the question
export const getPDFContentForQuestion = async (question: string) => {
  await ensureVectorStore()
  try {
    console.log('searching for:', question)
    const documents = await typesenseVectorStore.similaritySearch(question)
    console.log('retrieved documents:', documents)
    const content = documents
      .map((document_) => document_.pageContent)
      .join('\n\n')

    return content
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}
