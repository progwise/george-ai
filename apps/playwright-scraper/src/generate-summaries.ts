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
    async ({ id, originalContent, prompts, url }) => {
      if (prompts.length === 0) {
        console.log('no prompts found')
        return
      }

      await pMap(
        prompts,
        async ({ keywordPrompt, llm, locale, summaryPrompt }) => {
          const summaryAndKeywords = await getSummaryAndKeywords(
            originalContent,
            keywordPrompt,
            summaryPrompt,
          )
          if (!summaryAndKeywords) {
            return
          }

          await upsertWebPageSummary(
            url,
            summaryAndKeywords.summary,
            summaryAndKeywords.keywords,
            llm,
            locale,
            id,
          )
        },
        { concurrency: 2 },
      )
    },
    { concurrency: 6 },
  )
}

await generateSummaryAndKeywordsForAllScrapedPagesAndSave()
