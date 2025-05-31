import { Typesense, TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import { OpenAIEmbeddings } from '@langchain/openai'
import * as fs from 'fs'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'

import { loadFile } from './langchain-file'
import { generateQAPairs } from './qa-generator-remote'
import { summarizeDocument } from './summarizer'
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
  await ensureVectorStore(libraryId)

  const typesenseVectorStoreConfig = getTypesenseVectorStoreConfig(libraryId)

  const fileParts = await loadFile(file)

  const { chunkSize, chunkOverlap } = calculateChunkParams(fileParts)

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize,
    chunkOverlap,
    separators: ['\n\n', '\n', '.', ' ', ''], // from coarse to fine
  })

  await removeFileByName(libraryId, file.name)

  const splitDocument = await splitter.splitDocuments(fileParts)

  const fineTuningData: { prompt: string; completion: string }[] = []

  type QAPair = { prompt: string; completion: string }

  const qaPromises = splitDocument.map(async (chunk, i) => {
    console.log(`Processing chunk ${i + 1} of ${splitDocument.length}...`)
    const fullPageContent = fileParts.map((part) => part.pageContent).join('\n')
    const summary = await summarizeDocument(fullPageContent)
    const qaPairs: QAPair[] = await generateQAPairs(chunk.pageContent, summary)
    return qaPairs.map((qa: QAPair) => ({
      prompt: qa.prompt,
      completion: qa.completion,
    }))
  })

  const qaResults = await Promise.all(qaPromises)
  fineTuningData.push(...qaResults.flat())

  console.log('Processing complete.\n')

  const jsonlData = fineTuningData.map((qa) => JSON.stringify(qa)).join('\n')
  const qaDataDir = '../fine-tuning/jsonl/raw'
  if (!fs.existsSync(qaDataDir)) {
    fs.mkdirSync(qaDataDir, { recursive: true })
  }
  fs.writeFileSync(`${qaDataDir}/qa-data.jsonl`, jsonlData)

  await Typesense.fromDocuments(splitDocument, embeddings, typesenseVectorStoreConfig)

  return {
    id: file.id,
    name: file.name,
    originUri: file.originUri,
    mimeType: file.mimeType,
    chunks: splitDocument.length,
    size: splitDocument.reduce((acc, part) => acc + part.pageContent.length, 0),
  }
}

export const removeFileById = async (libraryId: string, fileId: string) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })
}

export const removeFileByName = async (libraryId: string, fileName: string) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docName:=\`${fileName}\`` })
}

export const similaritySearch = async (
  question: string,
  library: string,
): Promise<{ pageContent: string; docName: string }[]> => {
  //TODO: Vector search disabled because of language problems. The finals answer switches to english if enabled.
  // const questionAsVector = await embeddings.embedQuery(question)
  // const vectorQuery = `vec:([${questionAsVector.join(',')}])`
  await ensureVectorStore(library)
  const queryAsString = Array.isArray(question) ? question.join(' ') : question
  const multiSearchParams = {
    searches: [
      {
        collection: getTypesenseSchemaName(library),
        q: queryAsString,
        query_by: 'text,docName',
        // vector_query: vectorQuery,
        per_page: 200,
        order_by: '_text_match:desc',
      },
    ],
  }
  const searchResponse = await vectorTypesenseClient.multiSearch.perform<DocumentSchema[]>(multiSearchParams)

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
    const documents = await typesenseVectorStore.similaritySearch(question)
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
