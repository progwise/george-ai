import { ScrapedWebPage } from './gql/graphql'
import { ensureTypesenseCollectionExists } from './rebuild.collection'
import { client } from './typesense'

export const updateTypesenseDocument = async (document: ScrapedWebPage) => {
  console.log('document:', document)
  ensureTypesenseCollectionExists()
  const collectionName = 'scraped_web_pages_summaries'
  const documents =
    document.WebPageSummaries?.map((summary) => ({
      id: summary?.id,
      title: document.Title,
      url: document.Url,
      language: document.locale,
      originalContent: document.OriginalContent,
      publicationState: document.publishedAt ? 'published' : 'draft',
      keywords: summary?.GeneratedKeywords,
      summary: summary?.GeneratedSummary,
      largeLanguageModel: summary?.LargeLanguageModel,
    })) || []

  for (const document of documents) {
    await client.collections(collectionName).documents().upsert(document)
    console.log(
      `Data added to typesense in collection ${collectionName}`,
      document,
    )
  }
}
