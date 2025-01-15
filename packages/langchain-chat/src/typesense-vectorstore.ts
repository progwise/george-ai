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
import { DocxLoader } from '@langchain/community/document_loaders/fs/docx'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CSVLoader } from '@langchain/community/document_loaders/fs/csv'
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory'
import { JSONLoader, JSONLinesLoader } from 'langchain/document_loaders/fs/json'

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
  docType?: string
}) => {
  console.log('loading document:', document.fileName)
  const extension = document.docType?.toLowerCase() || 'pdf' // default to pdf if missing

  let loader
  switch (extension) {
    case 'pdf':
      loader = new PDFLoader(document.blob)
      break
    case 'docx':
      loader = new DocxLoader(document.blob)
      break
    case 'doc':
      loader = new DocxLoader(document.blob)
      break
    case 'txt':
      loader = new TextLoader(document.blob)
      break
    case 'csv':
      throw new Error(
        `CSV loading from a blob isn't directly supported without a file path. Convert or skip.`,
      )
    default:
      throw new Error(`Unsupported docType: ${document.docType}`)
  }

  const rawDocuments = await loader.load()

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  const splitDocuments = await splitter.splitDocuments(
    rawDocuments.map((d) => ({
      ...d,
      metadata: {
        docType: extension,
        docName: document.fileName,
        points: 1,
        docId: document.documentId,
      },
    })),
  )
  return splitDocuments
}

const loadDirectory = async (directoryPath: string) => {
  console.log('loading directory:', directoryPath)
  const loader = new DirectoryLoader(directoryPath, {
    '.json': (path) => new JSONLoader(path, '/texts'),
    '.jsonl': (path) => new JSONLinesLoader(path, '/html'),
    '.txt': (path) => new TextLoader(path),
    '.csv': (path) => new CSVLoader(path, 'text'),
    '.docx': (path) => new DocxLoader(path),
    '.doc': (path) => new DocxLoader(path),
    '.pdf': (path) => new PDFLoader(path),
  })

  const rawDocs = await loader.load()
  console.log(`DirectoryLoader loaded ${rawDocs.length} docs total.`)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  const splitDocs = await splitter.splitDocuments(rawDocs)

  return splitDocs
}

async function loadLocalDirectoryToVectorStore(directoryPath: string) {
  await ensureVectorStore()

  const splitDocs = await loadDirectory(directoryPath)

  const docIds = [...new Set(splitDocs.map((d) => d.metadata.source as string))]

  console.log('removing old local files from store:', docIds)
  for (const docId of docIds) {
    await typesenseVectorStoreConfig.typesenseClient
      .collections('gai-documents')
      .documents()
      .delete({ filter_by: `docId:=${docId}` })
  }

  try {
    await Typesense.fromDocuments(
      splitDocs,
      embeddings,
      typesenseVectorStoreConfig,
    )
    console.log('Local directory docs loaded into vector store.')
  } catch (error) {
    if (error instanceof ImportError) {
      console.error(
        'Error loading docs:',
        JSON.stringify(error.importResults, undefined, 2),
      )
    } else {
      console.error('Error loading docs:', error)
    }
  }
}

const removeFilesByDocumentIds = async (documentIds: string[]) => {
  const promises = documentIds.map((documentId) => {
    console.log('removing file:', documentId)
    return typesenseVectorStoreConfig.typesenseClient
      .collections('gai-documents')
      .documents()
      .delete({ filter_by: `docId:=${documentId}` })
  })
  await Promise.all(promises)
}

const loadDocuments = async (
  documents: Array<{
    fileName: string
    url: string
    blob: Blob
    documentId: string
    docType?: string
  }>,
) => {
  const splittedDocmentsArrays = await Promise.all(
    documents.map((d) => loadDocument(d)),
  )

  for (const splittedDocuments of splittedDocmentsArrays) {
    const documentIds = [
      ...new Set(splittedDocuments.map((d) => d.metadata.docId as string)),
    ]
    console.log('removing files from store:', documentIds)
    await removeFilesByDocumentIds(documentIds)

    console.log(
      'loading documents:',
      JSON.stringify(splittedDocuments, null, 2),
    )
    try {
      await Typesense.fromDocuments(
        splittedDocuments,
        embeddings,
        typesenseVectorStoreConfig,
      )
      console.log('setting documents as processed:', documentIds)
      await Promise.all(
        documentIds.map((id) => setDocumentProcessed({ documentId: id })),
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
  }
}

let processing = 0

export const loadUprocessedDocumentsIntoVectorStore = async () => {
  console.log('processing iteration:', processing++)
  await ensureVectorStore()

  const documents = await getUnprocessedDocuments()
  console.log(
    'unprocessed documents:',
    documents.map((d) => d.fileName),
  )

  await loadDocuments(
    documents.map((d) => ({
      fileName: d.fileName,
      url: d.url,
      blob: d.blob,
      documentId: d.documentId,
    })),
  )
}

export const getFileContentForQuestion = async (question: string) => {
  await ensureVectorStore()
  try {
    console.log('searching for:', question)
    const docs = await typesenseVectorStore.similaritySearch(question)
    console.log('retrieved documents:', docs)

    const content = docs.map((doc) => doc.pageContent).join('\n\n')
    return content
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}

export { loadLocalDirectoryToVectorStore }
