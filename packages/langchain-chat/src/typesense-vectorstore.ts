import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { Typesense, TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'
import { ImportError } from 'typesense/lib/Typesense/Errors'

import { getUnprocessedDocuments, setDocumentProcessed } from '@george-ai/pocketbase-client'

import { loadFile } from './langchain-file'
import { calculateChunkParams } from './vectorstore-settings'

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
  columnNames: {
    vector: 'vec',
    pageContent: 'text',
    metadataColumnNames: ['points', 'docName', 'docType', 'docId'],
  },

  // Optional search parameters to be passed to Typesense when searching
  searchParams: {
    q: '*',
    filter_by: '',
    query_by: 'text,docName',
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

const typesenseVectorStore = new Typesense(embeddings, getTypesenseVectorStoreConfig('gai-documents'))

export const ensureVectorStore = async (libraryId: string) => {
  const schemaName = getTypesenseSchemaName(libraryId)
  const exists = await vectorTypesenseClient.collections(schemaName).exists()
  if (!exists) {
    await vectorTypesenseClient.collections().create(getTypesenseSchema(libraryId))
  }
}

export const dropVectorStore = async (libraryId: string) => {
  const schemaName = getTypesenseSchemaName(libraryId)
  const exists = await vectorTypesenseClient.collections(schemaName).exists()
  if (exists) {
    await vectorTypesenseClient.collections(schemaName).delete()
  }
}

export const dropFileFromVectorstore = async (libraryId: string, fileId: string) => {
  await ensureVectorStore(libraryId)
  await removeFileById(libraryId, fileId)
}

export const embedFile = async (
  libraryId: string,
  file: {
    id: string
    name: string
    originUri: string
    mimeType: string
    path: string
  },
) => {
  console.log('embedding file:', file.name)
  await ensureVectorStore(libraryId)

  const typesenseVectorStoreConfig = getTypesenseVectorStoreConfig(libraryId)

  const fileParts = await loadFile(file)

  const { chunkSize, chunkOverlap } = calculateChunkParams(fileParts)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
  })

  await removeFileByName(libraryId, file.name)

  const splitDocument = await splitter.splitDocuments(fileParts)

  await Typesense.fromDocuments(splitDocument, embeddings, typesenseVectorStoreConfig)

  return {
    id: file.id,
    name: file.name,
    originUri: file.originUri,
    mimeType: file.mimeType,
    chunks: fileParts.length,
    size: fileParts.reduce((acc, part) => acc + part.pageContent.length, 0),
  }
}

/**
 * @deprecated The method should not be used
 */
const loadDocument = async (document: { fileName: string; url: string; blob: Blob; documentId: string }) => {
  console.log('loading document:', document.fileName)
  const loader = new PDFLoader(document.blob)
  const rawDocuments = await loader.load()

  const { chunkSize, chunkOverlap } = calculateChunkParams(rawDocuments)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
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

export const removeFileById = async (libraryId: string, fileId: string) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })
}

export const removeFileByName = async (libraryId: string, fileName: string) => {
  console.log('removing file:', fileName)
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docName:=\`${fileName}\`` })
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
    const documentIds = [...new Set(splitDocument.map((document) => document.metadata.docId))]
    console.log('removing files:', documentIds)
    await removeFilesByDocumentIds(documentIds)
    console.log('loading documents:', JSON.stringify(splitDocument, undefined, 2))
    try {
      await Typesense.fromDocuments(splitDocument, embeddings, getTypesenseVectorStoreConfig('common'))

      const documentIds = [...new Set(splitDocument.map((document) => document.metadata.docId))]

      console.log('setting documents as processed:', documentIds)

      await Promise.all(documentIds.map((documentId) => setDocumentProcessed({ documentId })))
    } catch (error) {
      if (error instanceof ImportError) {
        console.error('Error loading documents:', JSON.stringify(error.importResults, undefined, 2))
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

export const similaritySearch = async (
  question: string,
  library: string,
): Promise<{ pageContent: string; docName: string }[]> => {
  const questionAsVector = await embeddings.embedQuery(question)
  await ensureVectorStore(library)
  const searchResponse = await vectorTypesenseClient.multiSearch.perform<DocumentSchema[]>({
    searches: [
      {
        collection: getTypesenseSchemaName(library),
        q: question,
        query_by: 'text,docName',
        vector_query: `vec:([${questionAsVector.join(',')}])`,
        sort_by: '_text_match:desc',
        per_page: 100,
      },
    ],
  })

  const docs = searchResponse.results
    .flatMap((result) => result.hits)
    .map((hit) => ({
      pageContent: hit?.document.text,
      docName: hit?.document.docName,
    }))
  return docs
}

// retrieves content from the vector store similar to the question
export const getPDFContentForQuestion = async (question: string) => {
  await ensureVectorStore('common')
  try {
    console.log('searching for:', question)
    const documents = await typesenseVectorStore.similaritySearch(question)
    console.log('retrieved documents:', documents)
    const content = documents.map((document_) => document_.pageContent).join('\n\n')

    return content
  } catch (error) {
    console.error('Error retrieving PDF content:', error)
    return ''
  }
}

export const getPDFContentForQuestionAndLibraries = async (
  question: string,
  libraries: { id: string; name: string }[],
) => {
  const ensureStores = libraries.map((library) => ensureVectorStore(library.id))
  await Promise.all(ensureStores)

  const vectorStores = libraries.map((library) => new Typesense(embeddings, getTypesenseVectorStoreConfig(library.id)))

  const storeSearches = vectorStores.map((store) => store.similaritySearch(question))
  const storeSearchResults = await Promise.all(storeSearches)

  // Todo: Implement returning library name with content
  const contents = storeSearchResults.map((documents) =>
    documents.map((document_) => document_.pageContent).join('\n\n'),
  )

  return contents.join('\n\n')
}
