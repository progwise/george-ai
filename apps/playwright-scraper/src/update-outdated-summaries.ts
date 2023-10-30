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
      const { summaryId, scrapedPageId, originalContent, prompt } =
        outdatedSummary

      const summaryAndKeywords = await getSummaryAndKeywords(
        originalContent,
        prompt.promptForSummary,
        prompt.promptForKeywords,
      )

      if (!summaryAndKeywords) {
        return
      }

      const newSummary = {
        summary: summaryAndKeywords.summary,
        keywords: JSON.stringify(summaryAndKeywords.keywords),
        largeLanguageModel: prompt.largeLanguageModel,
        scraped_web_page: scrapedPageId,
        lastScrapeUpdate: new Date(),
        prompt: prompt,
      }

      await updateSummary(newSummary, summaryId)
    },
    { concurrency: 10 },
  )
}

await updateOutdatedSummaries()
