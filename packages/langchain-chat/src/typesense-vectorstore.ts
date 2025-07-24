import { Typesense, TypesenseConfig } from '@langchain/community/vectorstores/typesense'
// import { OpenAIEmbeddings } from '@langchain/openai'
import { OllamaEmbeddings } from '@langchain/ollama'
import fs from 'fs'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'

import { getMarkdownFilePath } from '@george-ai/file-management'

import { type QAPair, generateQAPairs } from './qa-generator-google'
import { splitMarkdown } from './split-markdown'
import { summarizeDocument } from './summarizer'

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

console.log(`setting up ollama embeddings to mistral:latest on ${process.env.OLLAMA_BASE_URL}`)

const embeddings = new OllamaEmbeddings({
  model: 'mistral:latest',
  baseUrl: process.env.OLLAMA_BASE_URL,
  keepAlive: '5m',
})

const typesenseVectorStore = new Typesense(embeddings, getTypesenseVectorStoreConfig('gai-documents'))

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

  const docVectors = await embeddings.embedDocuments(chunks.map((chunk) => chunk.pageContent))
  const saniatizedVectors = docVectors.map((vec) => {
    const sanitizedVector = new Array(3072).fill(0)
    for (let i = 0; i < Math.min(vec.length, sanitizedVector.length); i++) {
      sanitizedVector[i] = vec[i]
    }
    return sanitizedVector
  })
  const typesense = new Typesense(embeddings, typesenseVectorStoreConfig)
  await typesense.addVectors(saniatizedVectors, chunks)

  console.log('\n' + '='.repeat(60))
  console.log(`✨ Generating OVERALL DOCUMENT SUMMARY for: \x1b[36m${file.name}\x1b[0m ✨`)
  console.log('='.repeat(60) + '\n')
  const fullDocumentContent = chunks.map((chunk) => chunk.pageContent).join('\n\n')
  const overallDocumentSummary = await summarizeDocument(fullDocumentContent)
  console.log(`Generated overall document summary: ${overallDocumentSummary.substring(0, 100)}...`)

  console.log(`Processing ${chunks.length} chunks for training data generation...`)

  const trainingDataEntries: Array<{
    chunkIndex: number
    chunkContent: string
    chunkSummary: string
    overallDocumentSummary: string
    qaPairs: QAPair[]
    metadata: {
      section: string
      headingPath: string
      chunkIndex: number
      subChunkIndex: number
      points: number
      docName: string
      docType: string
      docId: string
      docPath: string
      originUri: string
    }
  }> = []

  const processedChunks = await Promise.all(
    chunks.map(async (chunk, index) => {
      try {
        console.log(`Processing chunk ${index + 1}/${chunks.length} for training data`)

        const chunkSummary = await summarizeDocument(chunk.pageContent)
        console.log(`Generated chunk summary for chunk ${index + 1}: ${chunkSummary.substring(0, 100)}...`)

        const contextualPrompt = `
Document Summary: ${overallDocumentSummary}

Chunk Summary: ${chunkSummary}

Chunk Content: ${chunk.pageContent}
`
        const qaPairs = await generateQAPairs(contextualPrompt, overallDocumentSummary)
        console.log(`Generated ${qaPairs.length} QA pairs for chunk ${index + 1}`)

        const trainingEntry = {
          chunkIndex: index,
          chunkContent: chunk.pageContent,
          chunkSummary,
          overallDocumentSummary,
          qaPairs,
          metadata: chunk.metadata,
        }

        trainingDataEntries.push(trainingEntry)

        return {
          ...chunk,
          chunkSummary,
          qaPairs,
        }
      } catch (error) {
        console.error(`Error processing chunk ${index + 1}:`, error)
        const emptyEntry = {
          chunkIndex: index,
          chunkContent: chunk.pageContent,
          chunkSummary: '',
          overallDocumentSummary,
          qaPairs: [] as QAPair[],
          metadata: chunk.metadata,
        }
        trainingDataEntries.push(emptyEntry)

        return {
          ...chunk,
          chunkSummary: '',
          qaPairs: [] as QAPair[],
        }
      }
    }),
  )

  const totalQAPairs = processedChunks.reduce((acc, chunk) => acc + chunk.qaPairs.length, 0)
  console.log(
    `Training data generation completed. Generated summaries for ${chunks.length} chunks and ${totalQAPairs} total QA pairs.`,
  )

  const trainingDataPath = `${markdownPath.replace('.md', '')}_training_data.jsonl`
  const trainingDataLines = trainingDataEntries.flatMap((entry) =>
    entry.qaPairs.map((qaPair) =>
      JSON.stringify({
        ...qaPair,
        sourceDocument: file.name,
        documentSummary: entry.overallDocumentSummary,
        chunkIndex: entry.chunkIndex,
        chunkSummary: entry.chunkSummary,
        metadata: entry.metadata,
      }),
    ),
  )

  fs.writeFileSync(trainingDataPath, trainingDataLines.join('\n'))
  console.log(`Training data saved to: ${trainingDataPath}`)

  return {
    id: file.id,
    name: file.name,
    originUri: file.originUri,
    docPath: file.path,
    mimeType: file.mimeType,
    chunks: chunks.length,
    size: chunks.reduce((acc, part) => acc + part.pageContent.length, 0),
    overallDocumentSummary,
    processedChunks,
    totalQAPairs,
    trainingDataPath,
    trainingDataEntries: trainingDataEntries.length,
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

/**
 * Exports all training data from a library into a consolidated JSONL file
 * suitable for LLM fine-tuning
 */
export const exportTrainingData = async (libraryId: string, outputPath?: string) => {
  const defaultOutputPath = `/tmp/training_data_${libraryId}_${Date.now()}.jsonl`
  const finalOutputPath = outputPath || defaultOutputPath

  console.log(`Exporting training data for library: ${libraryId}`)

  await ensureVectorStore(libraryId)
  const collectionName = getTypesenseSchemaName(libraryId)

  // Get all documents in the library
  const allDocuments = await vectorTypesenseClient.collections(collectionName).documents().search({
    q: '*',
    per_page: 1000, // Adjust as needed
    sort_by: 'docId:asc,chunkIndex:asc',
  })

  if (!allDocuments.hits || allDocuments.hits.length === 0) {
    console.log('No documents found in library')
    return { totalEntries: 0, outputPath: finalOutputPath }
  }

  // Group by document and process
  const docGroups = new Map()
  allDocuments.hits.forEach((hit: DocumentSchema) => {
    const docId = hit.document.docId
    if (!docGroups.has(docId)) {
      docGroups.set(docId, [])
    }
    docGroups.get(docId).push(hit.document)
  })

  const allTrainingEntries: string[] = []

  for (const [docId, chunks] of docGroups) {
    console.log(`Processing document ${docId} with ${chunks.length} chunks`)

    // Get overall document summary by combining all chunks
    const fullDocContent = chunks.map((chunk: DocumentSchema) => chunk.text).join('\n\n')
    const overallSummary = await summarizeDocument(fullDocContent)

    // Process each chunk
    for (const chunk of chunks) {
      try {
        const chunkSummary = await summarizeDocument(chunk.text || '')
        const contextualPrompt = `
Document Summary: ${overallSummary}

Chunk Summary: ${chunkSummary}

Chunk Content: ${chunk.text}
`
        const qaPairs = await generateQAPairs(contextualPrompt, overallSummary)

        // Add each QA pair as a training entry
        qaPairs.forEach((qaPair) => {
          const trainingEntry = {
            ...qaPair,
            sourceDocument: chunk.docName,
            documentSummary: overallSummary,
            chunkIndex: chunk.chunkIndex,
            chunkSummary,
            section: chunk.section,
            headingPath: chunk.headingPath,
            docId: chunk.docId,
            libraryId,
          }
          allTrainingEntries.push(JSON.stringify(trainingEntry))
        })
      } catch (error) {
        console.error(`Error processing chunk in document ${docId}:`, error)
      }
    }
  }

  // Save consolidated training data
  fs.writeFileSync(finalOutputPath, allTrainingEntries.join('\n'))

  console.log(`Training data exported: ${allTrainingEntries.length} entries saved to ${finalOutputPath}`)

  return {
    totalEntries: allTrainingEntries.length,
    outputPath: finalOutputPath,
    documentsProcessed: docGroups.size,
  }
}
