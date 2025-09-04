import { TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import fs from 'fs'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'

import { getOllamaEmbeddingsModel } from '@george-ai/ai-service-client'

import { getEmbeddingWithCache } from './embeddings-cache'
import { splitMarkdownFile } from './split-markdown'

const EMBEDDING_DIMENSIONS = 3072 // Assuming the embedding model has 3072 dimensions

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

export const embedMarkdownFile = async (args: {
  timeoutSignal: AbortSignal
  libraryId: string
  embeddingModelName: string
  fileId: string
  fileName: string
  originUri: string
  mimeType: string
  markdownFilePath: string
}) => {
  const { libraryId, embeddingModelName, fileId, fileName, originUri, mimeType, markdownFilePath } = args
  await ensureVectorStore(libraryId)

  const typesenseVectorStoreConfig = getTypesenseVectorStoreConfig(libraryId)

  // Use the provided path (should be resolved by caller to point to successful conversion)
  if (!fs.existsSync(markdownFilePath)) {
    throw new Error(`Markdown file not found: ${markdownFilePath}`)
  }

  // Not allowed any more because we handle multiple markdown files for the same source file
  //await removeFileByName(libraryId, fileName)

  if (args.timeoutSignal.aborted) {
    console.error(`❌ Embedding operation for file ${fileName} aborted due to timeout`)
    return { chunks: 0, size: 0, timeout: true }
  }

  const chunks = splitMarkdownFile(markdownFilePath).map((chunk) => ({
    pageContent: chunk.pageContent,
    metadata: {
      ...chunk.metadata,
      points: 1,
      docName: fileName,
      docType: mimeType,
      docId: fileId,
      docPath: markdownFilePath,
      originUri: originUri,
    },
  }))

  const embeddings = await getOllamaEmbeddingsModel(embeddingModelName)
  const vectors = await embeddings.embedDocuments(chunks.map((chunk) => chunk.pageContent))
  const sanitizedVectors = vectors.map((vector) => sanitizeVector(vector))

  if (args.timeoutSignal.aborted) {
    console.error(`❌ Embedding operation for file ${fileName} aborted due to timeout`)
    return {
      chunks: chunks.length,
      size: chunks.reduce((acc, part) => acc + part.pageContent.length, 0),
      timeout: true,
    }
  }

  await vectorTypesenseClient
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
      { action: 'create', dirty_values: 'drop' },
    )

  return {
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

const sanitizeVector = (vector: number[]) => {
  const sanitizedVector: Array<number> = new Array(EMBEDDING_DIMENSIONS).fill(0)
  for (let i = 0; i < Math.min(vector.length, sanitizedVector.length); i++) {
    sanitizedVector[i] = vector[i]
  }
  return sanitizedVector
}

export const similaritySearch = async (
  question: string,
  library: string,
  embeddingsModelName: string,
  docName?: string,
  maxHits?: number,
) => {
  const questionAsVector = await getEmbeddingWithCache(embeddingsModelName, question)
  const sanitizedVector = sanitizeVector(questionAsVector)
  await ensureVectorStore(library)
  const searchParams = {
    collection: getTypesenseSchemaName(library),
    q: '*',
    query_by: 'vec',
    vector_query: `vec:([${sanitizedVector.join(',')}], k:${maxHits || 10})`,
    exclude_fields: 'vec',
    ...(docName ? { filter_by: `docName: \`${docName}\`` } : {}),
  }
  const multiSearchParams = {
    searches: [searchParams],
  }
  const searchResponse = await vectorTypesenseClient.multiSearch.perform<DocumentSchema[]>(multiSearchParams)

  const hits = searchResponse.results[0].hits
  if (!hits || hits.length === 0) {
    return []
  }
  const docs = hits.map((hit) => ({
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

export const getFileChunkCount = async (libraryId: string, fileId: string): Promise<number> => {
  await ensureVectorStore(libraryId)
  const documents = await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .search({
      q: '*',
      filter_by: `docId:=${fileId}`,
      per_page: 1,
      page: 1,
    })
  return documents.found
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
      filter_by: `docId: \`${fileId}\``,
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
      fileName: hit.document.docName || 'no-name',
      fileId: hit.document.docId || 'no-file-id',
      originUri: hit.document.originUri || 'no-uri',
      text: hit.document.text || 'no-txt',
      section: hit.document.section || 'no-section',
      headingPath: hit.document.headingPath || 'no-path',
      chunkIndex: hit.document.chunkIndex || 0,
      subChunkIndex: hit.document.subChunkIndex || 0,
      points: hit.document.points || 0,
    })),
  }
}

export const getSimilarChunks = async (params: {
  libraryId: string
  fileId?: string
  term: string
  embeddingsModelName: string
  hits?: number
}) => {
  const { libraryId, fileId, term, embeddingsModelName, hits } = params
  const questionAsVector = await getEmbeddingWithCache(embeddingsModelName, term)
  const sanitizedVector = sanitizeVector(questionAsVector)
  await ensureVectorStore(libraryId)
  const searchParams = {
    collection: getTypesenseSchemaName(libraryId),
    q: '*',
    query_by: 'vec',
    vector_query: `vec:([${sanitizedVector.join(',')}], k:${hits || 10})`,
    exclude_fields: 'vec',
    ...(fileId ? { filter_by: `docId: \`${fileId}\`` } : {}),
  }
  const multiSearchParams = {
    searches: [searchParams],
  }
  const searchResponse = await vectorTypesenseClient.multiSearch.perform<DocumentSchema[]>(multiSearchParams)

  console.log('Typesense similarity search response:', JSON.stringify(searchResponse, null, 2))

  const resultHits = searchResponse.results[0].hits
  if (!resultHits || resultHits.length === 0) {
    return []
  }
  const chunks = resultHits.map((hit: DocumentSchema) => ({
    id: hit.document.id || 'no-id',
    fileName: hit.document.docName || 'no-name',
    fileId: hit.document.docId || 'no-file-id',
    originUri: hit.document.originUri || 'no-uri',
    text: hit.document.text || 'no-txt',
    section: hit.document.section || 'no-section',
    headingPath: hit.document.headingPath || 'no-path',
    chunkIndex: hit.document.chunkIndex || 0,
    subChunkIndex: hit.document.subChunkIndex || 0,
    distance: hit.vector_distance || 0,
    points: hit.document.points || 0,
  }))
  return chunks
}
