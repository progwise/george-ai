import { TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import fs from 'fs'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'

import { type ServiceProviderType, getEmbedding } from '@george-ai/ai-service-client'

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
    { name: 'part', type: 'int32', optional: true },
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
      'part',
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

export const embedMarkdownFile = async ({
  timeoutSignal,
  workspaceId,
  libraryId,
  embeddingModelProvider,
  embeddingModelName,
  fileId,
  fileName,
  originUri,
  mimeType,
  markdownFilePath,
  part,
}: {
  timeoutSignal: AbortSignal
  workspaceId: string
  libraryId: string
  embeddingModelProvider: ServiceProviderType
  embeddingModelName: string
  fileId: string
  fileName: string
  originUri: string
  mimeType: string
  markdownFilePath: string
  part?: number
}) => {
  await ensureVectorStore(libraryId)

  const typesenseVectorStoreConfig = getTypesenseVectorStoreConfig(libraryId)

  // Use the provided path (should be resolved by caller to point to successful conversion)
  if (!fs.existsSync(markdownFilePath)) {
    throw new Error(`Markdown file not found: ${markdownFilePath}`)
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
      ...(part !== undefined ? { part } : {}),
    },
  }))

  console.log(`🔍 Importing ${chunks.length} chunks into Typesense for file ${fileName}`)

  const successfulCreatedChunks: typeof chunks = []
  const failedChunks: Array<{ chunk: (typeof chunks)[number]; errorMessage: string }> = []

  try {
    for (const chunk of chunks) {
      if (timeoutSignal.aborted) {
        console.warn('⚠️ Embedding process aborted due to timeout signal')
        break
      }
      const embeddingResult = await getEmbedding(
        workspaceId,
        embeddingModelProvider,
        embeddingModelName,
        chunk.pageContent,
      )

      if (embeddingResult.embeddings.length === 0) {
        console.error('❌ No embeddings returned from Ollama')
        failedChunks.push({ chunk, errorMessage: 'No embeddings returned from model' })
        continue
      }
      const vector = embeddingResult.embeddings[0]
      try {
        await vectorTypesenseClient
          .collections(typesenseVectorStoreConfig.schemaName)
          .documents()
          .create({
            ...chunk.metadata,
            vec: sanitizeVector(vector), // Do not use cache for file chunks
            text: chunk.pageContent,
            points: 1,
            chunkIndex: chunk.metadata.chunkIndex,
            subChunkIndex: chunk.metadata.subChunkIndex,
            ...(part !== undefined ? { part } : {}),
          })
        successfulCreatedChunks.push(chunk)
      } catch (error) {
        console.error('❌ Error importing chunk into Typesense:', error, 'Chunk metadata:', chunk.metadata)
        failedChunks.push({ chunk, errorMessage: (error as Error).message })
      }
    }

    return {
      chunks: successfulCreatedChunks.length,
      chunkErrors: failedChunks,
      size: chunks.reduce((acc, part) => acc + part.pageContent.length, 0),
      timeout: timeoutSignal.aborted,
    }
  } catch (error) {
    console.error('❌ Error importing documents into Typesense:', error)
    throw error
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
      sort_by: 'chunkIndex:asc, part:asc, subChunkIndex:asc',
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
      part: hit.document.part,
    })),
  }
}

export const getSimilarChunks = async (params: {
  workspaceId: string
  libraryId: string
  fileId?: string
  term: string
  embeddingsModelProvider: ServiceProviderType
  embeddingsModelName: string
  hits?: number
}) => {
  const { workspaceId, libraryId, fileId, term, embeddingsModelProvider, embeddingsModelName, hits } = params
  const questionAsVector = await getEmbeddingWithCache({
    workspaceId,
    embeddingModelProvider: embeddingsModelProvider,
    embeddingModelName: embeddingsModelName,
    question: term,
  })
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
