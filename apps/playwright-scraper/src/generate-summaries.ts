import {
  getAllScrapedPages,
  upsertWebPageSummary,
} from '@george-ai/strapi-client'
import pMap from 'p-map'
import { getSummaryAndKeywords } from './chat-gpt'

const generateSummaryAndKeywordsForAllScrapedPagesAndSave = async () => {
  const scrapedWebPages = await getAllScrapedPages()

  if (scrapedWebPages?.length === 0) {
    console.log('no scrapedWebPages found')
    return
  }

  await pMap(
    scrapedWebPages,
    async ({ scrapedPageId, originalContent, prompts, url }) => {
      if (prompts.length === 0) {
        console.log('no prompts found')
        return
      }

      await pMap(
        prompts,
        async (prompt) => {
          const summaryAndKeywords = await getSummaryAndKeywords(
            originalContent,
            prompt.promptForSummary,
            prompt.promptForKeywords,
          )
          if (!summaryAndKeywords || summaryAndKeywords.keywords.length < 2) {
            return
          }

          await upsertWebPageSummary({
            url,
            summary: summaryAndKeywords.summary,
            keywords: summaryAndKeywords.keywords,
            largeLanguageModel: prompt.largeLanguageModel,
            currentLanguage: prompt.language,
            scrapedPageId,
            prompt,
          })
        },
        { concurrency: 2 },
      )
    },
    { concurrency: 6 },
  )
}

await generateSummaryAndKeywordsForAllScrapedPagesAndSave()
