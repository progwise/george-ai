import {
  getAllScrapedPages,
  upsertWebPageSummary,
} from '@george-ai/strapi-client'
import pMap from 'p-map'
import { getKeywords, getSummary } from './chat-gpt'

const createSummaryAndKeywordsForAllScrapedPagesAndSave = async () => {
  const scrapedWebPages = (await getAllScrapedPages()) || []

  if (scrapedWebPages?.length === 0) {
    console.log('no scrapedWebPages found')
    return
  }

  await pMap(
    scrapedWebPages,
    async (scrapedWebPage) => {
      if (!scrapedWebPage.id) {
        return
      }
      const prompts = scrapedWebPage.attributes?.prompts?.data || []
      if (prompts.length === 0) {
        console.log('no prompts found')
      }
      await pMap(
        prompts,
        async (prompt) => {
          const summary =
            (await getSummary(
              scrapedWebPage.attributes?.originalContent ?? '',
              JSON.parse(prompt.attributes?.summaryPrompt || ''),
            )) ?? ''
          const keywords =
            (await getKeywords(
              scrapedWebPage.attributes?.originalContent ?? '',
              JSON.parse(prompt.attributes?.keywordPrompt || ''),
            )) ?? []
          if (scrapedWebPage.id) {
            await upsertWebPageSummary(
              scrapedWebPage.attributes?.url ?? '',
              summary,
              keywords,
              prompt.attributes?.llm ?? 'unspecified',
              prompt.attributes?.locale ?? 'en',
              scrapedWebPage.id,
            )
          }
        },
        { concurrency: 2 },
      )
    },
    { concurrency: 6 },
  )
}

await createSummaryAndKeywordsForAllScrapedPagesAndSave()
