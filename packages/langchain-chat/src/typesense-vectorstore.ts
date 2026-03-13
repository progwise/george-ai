import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'

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

const removeFileById = async (libraryId: string, fileId: string) => {
  return await vectorTypesenseClient
    .collections(getTypesenseSchemaName(libraryId))
    .documents()
    .delete({ filter_by: `docId:=${fileId}` })
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

export const getFileChunkCount = async (libraryId: string, fileId: string, part?: number): Promise<number> => {
  await ensureVectorStore(libraryId)
  const filter_by = part !== undefined ? `docId:=${fileId} && part:=${part}` : `docId:=${fileId}`
  const documents = await vectorTypesenseClient.collections(getTypesenseSchemaName(libraryId)).documents().search({
    q: '*',
    filter_by,
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
  part,
}: {
  libraryId: string
  fileId: string
  skip: number
  take: number
  part?: number | null
}) => {
  await ensureVectorStore(libraryId)
  const collectionName = getTypesenseSchemaName(libraryId)

  // Build filter: always filter by fileId, optionally by part
  let filterBy = `docId: \`${fileId}\``
  if (part !== undefined && part !== null) {
    filterBy += ` && part:=${part}`
  }

  const documents = await vectorTypesenseClient
    .collections(collectionName)
    .documents()
    .search({
      q: '*',
      filter_by: filterBy,
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

export const querySimilarChunks = async (params: {
  libraryId: string
  fileId?: string
  part?: number | null
  scope?: 'library' | 'file' | 'file-part'
  term: string
  hits?: number
}) => {
  const { libraryId, fileId, part, scope = 'file-part', term, hits } = params
  // Build filter based on scope
  let filterBy = ''
  if (scope === 'file-part' && fileId && part !== null && part !== undefined) {
    // Filter by file AND part
    filterBy = `docId: \`${fileId}\` && part:=${part}`
  } else if ((scope === 'file' || scope === 'file-part') && fileId) {
    // Filter by file only (fallback when no part or scope is 'file')
    filterBy = `docId: \`${fileId}\``
  }
  const searchParams = {
    collection: getTypesenseSchemaName(libraryId),
    q: `${term}`,
    query_by: 'text,docName',
    exclude_fields: 'vec',
    per_page: hits || 10,
    ...(filterBy ? { filter_by: filterBy } : {}),
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
    part: hit.document.part || 0,
  }))
  return chunks
}
