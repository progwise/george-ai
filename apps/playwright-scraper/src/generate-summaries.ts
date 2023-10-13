import {
  getAllScrapedPages,
  upsertWebPageSummary,
} from '@george-ai/strapi-client'
import pMap from 'p-map'
import { getKeywords, getSummary } from './chat-gpt'

const generateSummaryAndKeywordsForAllScrapedPagesAndSave = async () => {
  const scrapedWebPages = (await getAllScrapedPages()) || []

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
          if (!keywordPrompt || !summaryPrompt) {
            console.log('no keywordPrompt or summaryPrompt found')
            return
          }
          const summary = await getSummary(
            originalContent,
            JSON.parse(summaryPrompt),
          )
          const keywords = await getKeywords(
            originalContent,
            JSON.parse(keywordPrompt),
          )

          await upsertWebPageSummary(url, summary, keywords, llm, locale, id)
        },
        { concurrency: 2 },
      )
    },
    { concurrency: 6 },
  )
}

await generateSummaryAndKeywordsForAllScrapedPagesAndSave()
