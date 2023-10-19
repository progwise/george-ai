import {
  getAllOutdatedSummaries,
  updateSummary,
} from '@george-ai/strapi-client'
import pMap from 'p-map'
import { getSummaryAndKeywords } from './chat-gpt'

const updateOutdatedSummaries = async () => {
  const outdatedSummaries = await getAllOutdatedSummaries()

  if (outdatedSummaries?.length === 0) {
    console.log('no outdated summaries found')
    return
  }

  await pMap(
    outdatedSummaries,
    async (outdatedSummary) => {
      const {
        summaryId,
        keywordPrompt,
        summaryPrompt,
        largeLanguageModel,
        scrapedPageId,
        originalContent,
      } = outdatedSummary

      const { keywords, summary } = await getSummaryAndKeywords(
        originalContent,
        keywordPrompt,
        summaryPrompt,
      )

      const newSummary = {
        summary,
        keywords: JSON.stringify(keywords),
        largeLanguageModel,
        scraped_web_page: scrapedPageId,
        lastScrapeUpdate: new Date(),
      }

      await updateSummary(newSummary, summaryId)
    },
    { concurrency: 10 },
  )
}

await updateOutdatedSummaries()
