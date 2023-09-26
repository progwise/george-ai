import {
  createWebPageSummary,
  createdScrapedWebPage,
  getScrapedWebPage,
  getWebPageSummaryId,
  updateWebPageSummary,
} from '@george-ai/strapi-client'
import { ScrapeResultAndSummary } from './main.js'
import { graphql } from './gql/gql'

const getOrCreateScrapedWebPage = async (
  scrapeResultAndSummary: ScrapeResultAndSummary,
) => {
  const existingScrapedWebPage = await getScrapedWebPage(
    scrapeResultAndSummary.url,
  )

  if (existingScrapedWebPage) {
    return existingScrapedWebPage
  }

  const scrapedWebPage = await createdScrapedWebPage(
    scrapeResultAndSummary.title,
    scrapeResultAndSummary.content,
    scrapeResultAndSummary.url,
    scrapeResultAndSummary.scrapedLanguage,
  )

  console.log('Created ScrapedWebPage with ID:', scrapedWebPage?.id)

  return scrapedWebPage
}

const upsertWebPageSummary = async (
  scrapeResultAndSummary: ScrapeResultAndSummary,
  ScrapedWebPageId: string,
) => {
  const newSummary = {
    summary: scrapeResultAndSummary.summary,
    keywords: JSON.stringify(scrapeResultAndSummary.keywords),
    largeLanguageModel: scrapeResultAndSummary.largeLanguageModel,
    scraped_web_page: ScrapedWebPageId,
  }

  const webPageSummaryId = await getWebPageSummaryId(
    scrapeResultAndSummary.largeLanguageModel,
    scrapeResultAndSummary.url,
    scrapeResultAndSummary.currentLanguage,
  )

  webPageSummaryId
    ? await updateWebPageSummary(webPageSummaryId, newSummary)
    : await createWebPageSummary(
        newSummary,
        scrapeResultAndSummary.currentLanguage,
      )
}

export const upsertScrapedWebPageAndWebPageSummary = async (
  scrapeResultAndSummary: ScrapeResultAndSummary,
) => {
  const createdScrapedWebPage = await getOrCreateScrapedWebPage(
    scrapeResultAndSummary,
  )

  if (createdScrapedWebPage?.id) {
    await upsertWebPageSummary(scrapeResultAndSummary, createdScrapedWebPage.id)
  }
}
