import { ensureCollectionExists, upsertDocument } from './typesense.js'

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

// TODO: any
export const rebuildTypesenseCollection = async (webPageSummaries: any) => {
  try {
    await ensureCollectionExists()

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
      await upsertDocument(document)
    }
  } catch (error) {
    console.error(error)
  }
}
