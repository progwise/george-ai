import { FieldType } from 'typesense/lib/Typesense/Collection.js'
import { client } from './typesense.js'

interface ScrapedWebPageAttributes {
  Title?: string | null
  Url?: string | null
  OriginalContent?: string | null
  locale?: string | null
  publishedAt?: any | null
}
interface ScrapedWebPageData {
  attributes?: ScrapedWebPageAttributes | null
}

interface WebPageSummaryAttributes {
  Keywords?: string | null
  Summary?: string | null
  LargeLanguageModel?: string | null
  scraped_web_pages?: {
    data?: ScrapedWebPageData | null
  } | null
}

interface WebPageSummaryEntity {
  id?: string | null
  attributes?: WebPageSummaryAttributes | null
}

export interface WebPageSummaries {
  data: WebPageSummaryEntity[]
}

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

// TODO: any
export const rebuildTypesenseCollection = async (webPageSummaries: any) => {
  try {
    const collectionName = 'scraped_web_pages_summaries'
    const collectionExists = await client.collections(collectionName).exists()
    const collectionSchema = {
      ...baseCollectionSchema,
      name: collectionName,
    }
    if (!collectionExists) {
      await client.collections().create(collectionSchema)
      console.log(`Collection ${collectionName} created`)
    }

    const documents =
      webPageSummaries?.data.map((summary: any) => ({
        id: summary?.id,
        title: summary.attributes?.scraped_web_pages?.data?.attributes?.Title,
        url: summary.attributes?.scraped_web_pages?.data?.attributes?.Url,
        language:
          summary.attributes?.scraped_web_pages?.data?.attributes?.locale,
        originalContent:
          summary.attributes?.scraped_web_pages?.data?.attributes
            ?.OriginalContent,
        publicationState: summary.attributes?.scraped_web_pages?.data
          ?.attributes?.publishedAt
          ? 'published'
          : 'draft',
        keywords: summary?.attributes?.Keywords
          ? JSON.parse(summary.attributes?.Keywords)
          : [],
        summary: summary.attributes?.Summary,
        largeLanguageModel: summary.attributes?.LargeLanguageModel,
      })) || []

    for (const document of documents) {
      await client.collections(collectionName).documents().upsert(document)
      console.log(
        `Data added to typesense in collection ${collectionName} by id: ${document.id}`,
      )
    }
  } catch (error) {
    console.error(error)
  }
}
