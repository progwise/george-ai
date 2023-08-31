import {
  ensureCollectionExists,
  typesenseClient,
  upsertDocument,
} from './typesense.js'

interface ScrapedWebPagesData {
  id: string
  Title: string
  Url: string
  locale: string
  OriginalContent: string
  publishedAt: string
}

interface WebPageSummary {
  id: string
  Keywords: string
  Summary: string
  LargeLanguageModel: string
  scraped_web_pages: ScrapedWebPagesData
}

export const upsertTypesenseDocument = async (
  webPageSummary: WebPageSummary,
) => {
  await ensureCollectionExists()

  const document =
    {
      id: webPageSummary.id.toString(),
      title: webPageSummary.scraped_web_pages.Title,
      url: webPageSummary.scraped_web_pages.Url,
      language: webPageSummary.scraped_web_pages.locale,
      originalContent: webPageSummary.scraped_web_pages.OriginalContent,
      publicationState: webPageSummary.scraped_web_pages.publishedAt
        ? 'published'
        : 'draft',
      keywords: webPageSummary?.Keywords
        ? JSON.parse(webPageSummary?.Keywords)
        : [],
      summary: webPageSummary?.Summary,
      largeLanguageModel: webPageSummary?.LargeLanguageModel,
    } || {}

  await upsertDocument(document)
}
