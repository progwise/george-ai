import { WebPageSummaryEntity } from './gql/graphql.js'
import { typesenseClient } from './typesense.js'
import { FieldType } from 'typesense/lib/Typesense/Collection.js'

const baseCollectionSchema: {
  name: string
  fields: {
    name: string
    type: FieldType
    optional?: boolean
  }[]
} = {
  name: '',
  fields: [
    { name: 'id', type: 'string' },
    { name: 'title', type: 'string' },
    { name: 'url', type: 'string' },
    { name: 'language', type: 'string' },
    { name: 'originalContent', type: 'string' },
    { name: 'publicationState', type: 'string' },
    { name: 'keywords', type: 'string[]' },
    { name: 'summary', type: 'string' },
    { name: 'largeLanguageModel', type: 'string' },
  ],
}

export const upsertTypesenseCollection = async (
  webPageSummary: WebPageSummaryEntity,
) => {
  const collectionName = 'scraped_web_pages_summaries'

  try {
    const collectionExists = await typesenseClient
      .collections(collectionName)
      .exists()

    if (!collectionExists) {
      const collectionSchema = {
        ...baseCollectionSchema,
        name: collectionName,
      }

      await typesenseClient.collections().create(collectionSchema)
      console.log(`Collection ${collectionName} created`)
    }

    const document = {
      id: webPageSummary?.id,
      title:
        webPageSummary.attributes?.scraped_web_pages?.data?.attributes?.Title,
      url: webPageSummary.attributes?.scraped_web_pages?.data?.attributes?.Url,
      language:
        webPageSummary.attributes?.scraped_web_pages?.data?.attributes?.locale,
      originalContent:
        webPageSummary.attributes?.scraped_web_pages?.data?.attributes
          ?.OriginalContent,
      publicationState: webPageSummary.attributes?.scraped_web_pages?.data
        ?.attributes?.publishedAt
        ? 'published'
        : 'draft',
      keywords: webPageSummary?.attributes?.Keywords
        ? JSON.parse(webPageSummary.attributes?.Keywords)
        : [],
      summary: webPageSummary.attributes?.Summary,
      largeLanguageModel: webPageSummary.attributes?.LargeLanguageModel,
    }

    await typesenseClient
      .collections(collectionName)
      .documents()
      .upsert(document)
    console.log(
      `Data upsert to typesense in collection ${collectionName} by id: ${document.id}`,
    )
  } catch (error) {
    console.error(error)
  }
}
