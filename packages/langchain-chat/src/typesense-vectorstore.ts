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
import { loadFile } from './langchain-file'

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

const getTypesenseSchemaName = (knowledgeSourceId: string) =>
  `gai-knowledge-source-${knowledgeSourceId}`

const getTypesenseSchema = (
  knowledgeSourceId: string,
): CollectionCreateSchema => ({
  name: getTypesenseSchemaName(knowledgeSourceId),
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

const getTypesenseVectorStoreConfig = (
  knowledgeSourceId: string,
): TypesenseConfig => ({
  typesenseClient: vectorTypesenseClient,
  schemaName: getTypesenseSchemaName(knowledgeSourceId),
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
})

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-3-large',
  dimensions: 3072,
})

const typesenseVectorStore = new Typesense(
  embeddings,
  getTypesenseVectorStoreConfig('gai-documents'),
)

export const ensureVectorStore = async (knowledgeSourceId: string) => {
  const schemaName = getTypesenseSchemaName(knowledgeSourceId)
  const exists = await vectorTypesenseClient.collections(schemaName).exists()
  if (!exists) {
    await vectorTypesenseClient
      .collections()
      .create(getTypesenseSchema(knowledgeSourceId))
  }
}

export const dropVectorStore = async (knowledgeSourceId: string) => {
  const schemaName = getTypesenseSchemaName(knowledgeSourceId)
  const exists = await vectorTypesenseClient.collections(schemaName).exists()
  if (exists) {
    await vectorTypesenseClient.collections(schemaName).delete()
  }
}

export const dropFile = async (knowledgeSourceId: string, fileId: string) => {
  await ensureVectorStore(knowledgeSourceId)
  await removeFileById(knowledgeSourceId, fileId)
}

export const embedFiles = async (
  knowledgeSourceId: string,
  files: [
    {
      id: string
      name: string
      url: string
      mimeType: string
      content: Blob
    },
  ],
) => {
  await ensureVectorStore(knowledgeSourceId)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })

  const loadedFiles = await Promise.all(
    files.map(async (file) => ({
      fileName: file.name,
      url: file.url,
      mimeType: file.mimeType,
      content: await loadFile({
        mimeType: file.mimeType,
        name: file.name,
        id: file.id,
        blob: file.content,
      }),
    })),
  )

  const typesenseVectorStoreConfig =
    getTypesenseVectorStoreConfig(knowledgeSourceId)

  await Promise.all(
    loadedFiles.map(async (loadedFile) => {
      await removeFileByName(knowledgeSourceId, loadedFile.fileName)
    }),
  )

  await Promise.all(
    loadedFiles.map(async (loadedFile) => {
      const splitDocument = await splitter.splitDocuments(loadedFile.content)

      console.log('split document:', splitDocument)
      return await Typesense.fromDocuments(
        splitDocument,
        embeddings,
        typesenseVectorStoreConfig,
      )
    }),
  )
  return loadedFiles
}

/**
 * @deprecated The method should not be used
 */
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

export const removeFileById = async (
  knowledgeSourceId: string,
  fileId: string,
) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(knowledgeSourceId))
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })
}

export const removeFileByName = async (
  knowledgeSourceId: string,
  fileName: string,
) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(knowledgeSourceId))
    .documents()
    .delete({ filter_by: `docName:=${fileName}` })
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
        getTypesenseVectorStoreConfig('common'),
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
  await ensureVectorStore('common')
  const documents = await getUnprocessedDocuments()
  console.log(
    'unprocessed documents:',
    documents.map((d) => d.fileName),
  )
  await loadDocuments(documents)
}

// retrieves content from the vector store similar to the question
export const getPDFContentForQuestion = async (question: string) => {
  await ensureVectorStore('common')
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
