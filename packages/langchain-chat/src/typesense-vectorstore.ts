import { Typesense, TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import { OllamaEmbeddings } from '@langchain/ollama'
import fs from 'fs'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'

import { getMarkdownFilePath } from '@george-ai/file-management'

import { splitMarkdown } from './split-markdown'

const EMBEDDING_DIMENSIONS = 3072 // Assuming the embedding model has 3072 dimensions

const getEmbeddingsModelInstance = async (model: string): Promise<OllamaEmbeddings> => {
  const embeddings = new OllamaEmbeddings({
    model,
    baseUrl: process.env.OLLAMA_BASE_URL,
    keepAlive: '5m',
  })

  return embeddings
}

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
    { name: 'vec', type: 'float[]', num_dim: EMBEDDING_DIMENSIONS },
    { name: 'text', type: 'string' },
    { name: 'docName', type: 'string' },
    { name: 'docType', type: 'string' },
    { name: 'docId', type: 'string' },
    { name: 'docPath', type: 'string' },
    { name: 'originUri', type: 'string' },
    { name: 'section', type: 'string' },
    { name: 'headingPath', type: 'string' },
    { name: 'chunkIndex', type: 'int32' },
    { name: 'subChunkIndex', type: 'int32' },
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
    metadataColumnNames: [
      'points',
      'docName',
      'docType',
      'docId',
      'docPath',
      'originUri',
      'section',
      'headingPath',
      'chunkIndex',
      'subChunkIndex',
    ],
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

export const ensureVectorStore = async (libraryId: string) => {
  const schemaName = getTypesenseSchemaName(libraryId)
  const existingSchema = vectorTypesenseClient.collections(schemaName)
  if (!(await existingSchema.exists())) {
    await vectorTypesenseClient.collections().create(getTypesenseSchema(libraryId))
  } else {
    const existingFieldNames = (await existingSchema.retrieve()).fields.map((field) => field.name)
    const allFields = getTypesenseSchema(libraryId).fields
    const missingFields = allFields.filter((field) => !existingFieldNames.some((name) => name === field.name))
    if (missingFields.length < 1) {
      return
    }
    await existingSchema.update({ fields: missingFields.map((field) => ({ ...field, optional: true })) })
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
  embeddingModelName: string,
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
  const markdownPath = getMarkdownFilePath({ fileId: file.id, libraryId })
  if (!fs.existsSync(markdownPath)) {
    throw new Error(`Markdown file not found: ${markdownPath}`)
  }
  await removeFileByName(libraryId, file.name)
  const chunks = splitMarkdown(markdownPath).map((chunk) => ({
    pageContent: chunk.pageContent,
    metadata: {
      ...chunk.metadata,
      points: 1,
      docName: file.name,
      docType: file.mimeType,
      docId: file.id,
      docPath: markdownPath,
      originUri: file.originUri,
    },
  }))

  const embeddings = await getEmbeddingsModelInstance(embeddingModelName)
  console.log(`Embedding ${chunks.length} chunks for file ${file.name} with model ${embeddingModelName}`)
  const vectors = await embeddings.embedDocuments(chunks.map((chunk) => chunk.pageContent))
  const sanitizedVectors = vectors.map((vector) => {
    const sanitizedVector = new Array<number>(EMBEDDING_DIMENSIONS).fill(0)
    for (let i = 0; i < Math.min(vector.length, sanitizedVector.length); i++) {
      sanitizedVector[i] = vector[i]
    }
    return sanitizedVector
  })

  vectorTypesenseClient
    .collections(typesenseVectorStoreConfig.schemaName)
    .documents()
    .import(
      chunks.map((chunk, index) => ({
        ...chunk.metadata,
        vec: sanitizedVectors[index],
        text: chunk.pageContent,
        points: 1,
        chunkIndex: index,
        subChunkIndex: 0,
      })),
      { action: 'upsert', dirty_values: 'drop' },
    )

  return {
    id: file.id,
    name: file.name,
    originUri: file.originUri,
    docPath: file.path,
    mimeType: file.mimeType,
    chunks: chunks.length,
    size: chunks.reduce((acc, part) => acc + part.pageContent.length, 0),
  }
}

const removeFileById = async (libraryId: string, fileId: string) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })
}

const removeFileByName = async (libraryId: string, fileName: string) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docName:=\`${fileName}\`` })
}
export const similaritySearch = async (
  question: string,
  library: string,
  embeddingsModelName: string,
): Promise<{ pageContent: string; docName: string }[]> => {
  //TODO: Vector search disabled because of language problems. The finals answer switches to english if enabled.
  const embeddings = await getEmbeddingsModelInstance(embeddingsModelName)
  const questionAsVector = await embeddings.embedQuery(question)
  const sanitizedVector = new Array(EMBEDDING_DIMENSIONS).fill(0)
  for (let i = 0; i < Math.min(questionAsVector.length, sanitizedVector.length); i++) {
    sanitizedVector[i] = questionAsVector[i]
  }
  const vectorQuery = `vec:([${sanitizedVector.join(',')}])`
  await ensureVectorStore(library)
  const queryAsString = Array.isArray(question) ? question.join(' ') : question
  const multiSearchParams = {
    searches: [
      {
        collection: getTypesenseSchemaName(library),
        q: queryAsString,
        query_by: 'text,docName',
        vector_query: vectorQuery,
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
      docPath: hit?.document.docPath,
      docId: hit?.document.docId,
      id: hit?.document.id,
      originUri: hit?.document.originUri,
    }))
  return docs
}
interface queryVectorStoreOptions {
  perPage: number
  page: number
  filterBy?: string
  queryBy?: string
}
export const queryVectorStore = async (
  libraryId: string,
  query: string,
  { perPage = 20, page = 1, filterBy = '', queryBy = 'docName,text' }: queryVectorStoreOptions,
): Promise<{
  hits: {
    pageContent: string
    docName: string
    docId: string
    id: string
    docPath: string
    originUri: string
    highlights: Array<{ field: string; snippet?: string }>
  }[]
  hitCount: number
}> => {
  await ensureVectorStore(libraryId)
  const searchResponse = await vectorTypesenseClient.multiSearch.perform<DocumentSchema[]>({
    searches: [
      {
        collection: getTypesenseSchemaName(libraryId),
        q: query.length > 0 ? query : '*',
        per_page: perPage,
        page: page,
        filter_by: filterBy,
        query_by: queryBy,
      },
    ],
  })
  const hits = searchResponse.results
    .flatMap((result) => result.hits)
    .map((hit) => ({
      pageContent: hit?.document.text || '',
      docName: hit?.document.docName || '',
      docId: hit?.document.docId || '',
      id: hit?.document.id || '',
      docPath: hit?.document.docPath || '',
      originUri: hit?.document.originUri || '',
      highlights: hit?.highlights || [],
    }))
  return {
    hits,
    hitCount: searchResponse.results.map((result) => result.found || 0).reduce((prev, curr) => prev + curr, 0),
  }
}
export const getFileChunks = async ({
  libraryId,
  fileId,
  skip,
  take,
}: {
  libraryId: string
  fileId: string
  skip: number
  take: number
}) => {
  await ensureVectorStore(libraryId)
  const collectionName = getTypesenseSchemaName(libraryId)
  const documents = await vectorTypesenseClient
    .collections(collectionName)
    .documents()
    .search({
      q: '*',
      filter_by: `docId:=${fileId}`,
      sort_by: 'chunkIndex:asc',
      per_page: take,
      page: 1 + skip / take,
    })
  if (!documents.hits || documents.hits.length === 0) {
    return { count: 0, skip, take, chunks: [] }
  }
  return {
    count: documents.found,
    skip,
    take,
    chunks: documents.hits.map((hit: DocumentSchema) => ({
      id: hit.document.id || 'no-id',
      text: hit.document.text || 'no-txt',
      section: hit.document.section || 'no-section',
      headingPath: hit.document.headingPath || 'no-path',
      chunkIndex: hit.document.chunkIndex || 0,
      subChunkIndex: hit.document.subChunkIndex || 0,
    })),
  }
}

export const getPDFContentForQuestionAndLibraries = async (
  question: string,
  libraries: { id: string; name: string; embeddingModelName: string }[],
) => {
  const ensureStores = libraries.map((library) => ensureVectorStore(library.id))
  await Promise.all(ensureStores)
  const vectorStores = await Promise.all(
    libraries.map(async (library) => {
      const embeddings = await getEmbeddingsModelInstance(library.embeddingModelName)
      return new Typesense(embeddings, getTypesenseVectorStoreConfig(library.id))
    }),
  )

  const storeSearches = vectorStores.map((store) => store.similaritySearch(question))
  const storeSearchResults = await Promise.all(storeSearches)
  // Todo: Implement returning library name with content
  const contents = storeSearchResults.map((documents) =>
    documents.map((document_) => document_.pageContent).join('\n\n'),
  )

  const result = contents.filter((content) => content.length > 0).join('\n\n')
  console.log(`Found ${contents.length} libraries with content for question "${question}"`)
  console.log(result.length > 1000 ? `Content is too long to display (${result.length} characters)` : result)

  return result
}
