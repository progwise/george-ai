import { TypesenseConfig } from '@langchain/community/vectorstores/typesense'
import { OllamaEmbeddings } from '@langchain/ollama'
import fs from 'fs'
import { Client } from 'typesense'
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections'
import type { DocumentSchema } from 'typesense/lib/Typesense/Documents'

import { getMarkdownFilePath } from '@george-ai/file-management'

import { type QAPair, generateQAPairs } from './qa-generator'
import { splitMarkdown } from './split-markdown'
import { summarizeDocument } from './summarizer'

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

  console.log('\n' + '='.repeat(60))
  console.log(`Generating OVERALL DOCUMENT SUMMARY for: \x1b[36m${file.name}\x1b[0m`)
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
      const actualChunkIndex = chunk.metadata.chunkIndex
      try {
        console.log(`Processing chunk ${actualChunkIndex} (${index + 1}/${chunks.length}) for training data`)

        const chunkSummary = await summarizeDocument(chunk.pageContent)
        console.log(`Generated chunk summary for chunk ${actualChunkIndex}: ${chunkSummary.substring(0, 100)}...`)

        const contextualPrompt = `
Document Summary: ${overallDocumentSummary}

Chunk Summary: ${chunkSummary}

Chunk Content: ${chunk.pageContent}
`
        const qaPairs = await generateQAPairs(contextualPrompt, overallDocumentSummary)
        console.log(`Generated ${qaPairs.length} QA pairs for chunk ${actualChunkIndex}`)

        // Ensure we have at least some QA pairs, retry if empty
        if (qaPairs.length === 0) {
          console.warn(`No QA pairs generated for chunk ${actualChunkIndex}, retrying with simplified prompt...`)
          const simplifiedPrompt = `Create question-answer pairs from this text:\n\n${chunk.pageContent}\n\nGenerate 2-3 clear questions with accurate answers.`
          const retryQAPairs = await generateQAPairs(simplifiedPrompt, overallDocumentSummary)
          console.log(`Retry generated ${retryQAPairs.length} QA pairs for chunk ${actualChunkIndex}`)

          const trainingEntry = {
            chunkIndex: actualChunkIndex,
            chunkContent: chunk.pageContent,
            chunkSummary,
            overallDocumentSummary,
            qaPairs: retryQAPairs,
            metadata: chunk.metadata,
          }
          trainingDataEntries.push(trainingEntry)

          return {
            ...chunk,
            chunkSummary,
            qaPairs: retryQAPairs,
          }
        }

        const trainingEntry = {
          chunkIndex: actualChunkIndex,
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
        console.error(`Error processing chunk ${actualChunkIndex}:`, error)
        console.error(`Chunk content preview: ${chunk.pageContent.substring(0, 200)}...`)

        // Try to generate at least a basic summary and simple QA
        let fallbackSummary = ''
        let fallbackQAPairs: QAPair[] = []

        try {
          fallbackSummary = await summarizeDocument(chunk.pageContent)
          const basicPrompt = `What is this text about? ${chunk.pageContent.substring(0, 500)}`
          fallbackQAPairs = await generateQAPairs(basicPrompt, overallDocumentSummary)
        } catch (fallbackError) {
          console.error(`Fallback processing also failed for chunk ${actualChunkIndex}:`, fallbackError)
          fallbackSummary = `Error: Could not summarize chunk ${actualChunkIndex}`
        }

        const emptyEntry = {
          chunkIndex: actualChunkIndex,
          chunkContent: chunk.pageContent,
          chunkSummary: fallbackSummary,
          overallDocumentSummary,
          qaPairs: fallbackQAPairs,
          metadata: chunk.metadata,
        }
        trainingDataEntries.push(emptyEntry)

        return {
          ...chunk,
          chunkSummary: fallbackSummary,
          qaPairs: fallbackQAPairs,
        }
      }
    }),
  )

  const totalQAPairs = processedChunks.reduce((acc, chunk) => acc + chunk.qaPairs.length, 0)
  console.log(
    `Training data generation completed. Generated summaries for ${chunks.length} chunks and ${totalQAPairs} total QA pairs.`,
  )

  const trainingDataPath = `${markdownPath.replace('.md', '')}_training_data.json`

  // Create hierarchical structure without redundancy
  const hierarchicalTrainingData = {
    document: {
      id: file.id,
      name: file.name,
      mimeType: file.mimeType,
      originUri: file.originUri,
      docPath: markdownPath,
      summary: overallDocumentSummary,
      totalChunks: chunks.length,
      totalQAPairs,
      chunks: trainingDataEntries
        .sort((a, b) => a.chunkIndex - b.chunkIndex) // Sort by actual chunk index
        .map((entry) => ({
          chunkIndex: entry.chunkIndex,
          section: entry.metadata.section,
          headingPath: entry.metadata.headingPath,
          subChunkIndex: entry.metadata.subChunkIndex,
          summary: entry.chunkSummary,
          qaPairs: entry.qaPairs.map((qaPair) => ({
            prompt: qaPair.prompt,
            completion: qaPair.completion,
            category: qaPair.category || ['general'],
            difficulty: qaPair.difficulty || ['medium'],
          })),
        })),
    },
  }

  // Save hierarchical structure locally
  fs.writeFileSync(trainingDataPath, JSON.stringify(hierarchicalTrainingData, null, 2))
  console.log(`Training data saved to: ${trainingDataPath}`)

  // Also save QA pairs in JSONL format for fine-tuning
  const fineTuningDir = '/workspaces/george-ai/apps/fine-tuning/jsonl/raw'
  const fineTuningPath = fineTuningDir + '/qa-data.jsonl'

  // Create directory if it doesn't exist
  if (!fs.existsSync(fineTuningDir)) {
    fs.mkdirSync(fineTuningDir, { recursive: true })
    console.log(`Created fine-tuning directory: ${fineTuningDir}`)
  }

  // Convert QA pairs to JSONL format for fine-tuning
  // Check the chat template type from the qa-generator to determine output format
  const qaJsonlEntries = trainingDataEntries.flatMap((entry) =>
    entry.qaPairs.map((qaPair) => {
      // For now, preserve the basic format but add metadata
      // TODO: The generateQAPairs function should return the chat template formatted data directly
      return {
        prompt: qaPair.prompt,
        completion: qaPair.completion,
        sourceDocument: file.name,
        chunkIndex: entry.chunkIndex,
        section: entry.metadata.section,
        category: qaPair.category || ['general'],
        difficulty: qaPair.difficulty || ['medium'],
      }
    }),
  )

  // Save raw QA pairs (for backward compatibility)
  const jsonlLines = qaJsonlEntries.map((entry) => JSON.stringify(entry)).join('\n')
  if (fs.existsSync(fineTuningPath)) {
    fs.appendFileSync(fineTuningPath, '\n' + jsonlLines)
    console.log(`Appended ${qaJsonlEntries.length} QA pairs to: ${fineTuningPath}`)
  } else {
    fs.writeFileSync(fineTuningPath, jsonlLines)
    console.log(`Created fine-tuning dataset with ${qaJsonlEntries.length} QA pairs: ${fineTuningPath}`)
  }

  console.log(`Successfully processed ${chunks.length} chunks with ${totalQAPairs} total QA pairs`)
  console.log(`Training data available at: ${trainingDataPath}`)
  console.log(`Fine-tuning data available at: ${fineTuningPath}`)

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
  docName?: string,
  maxHits?: number,
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
        per_page: maxHits || 200,
        order_by: '_text_match:desc',
        ...(docName ? { filter_by: `docName: \`${docName}\`` } : {}),
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

/**
 * Clears the fine-tuning dataset file
 */
export const clearFineTuningDataset = () => {
  const fineTuningPath = '/workspaces/george-ai/apps/fine-tuning/jsonl/raw/qa-data.jsonl'
  if (fs.existsSync(fineTuningPath)) {
    fs.unlinkSync(fineTuningPath)
    console.log(`🗑️ Cleared fine-tuning dataset: ${fineTuningPath}`)
  } else {
    console.log(`📝 Fine-tuning dataset doesn't exist: ${fineTuningPath}`)
  }
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
