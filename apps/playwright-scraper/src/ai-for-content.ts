import {
  getAllScrapedPages,
  upsertWebPageSummary,
} from '@george-ai/strapi-client'
import pMap from 'p-map'
import { getKeywords, getSummary } from './chat-gpt'

const aiForContent = async () => {
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
          const ScrapedUrlAndSummary = {
            url: scrapedWebPage.attributes?.url ?? '',
            summary,
            keywords,
            largeLanguageModel: prompt.attributes?.llm ?? 'unspecified',
            currentLanguage: prompt.attributes?.locale ?? 'en',
          }
          if (scrapedWebPage?.id) {
            await upsertWebPageSummary(ScrapedUrlAndSummary, scrapedWebPage?.id)
          }
        },
        { concurrency: 2 },
      )
    },
    { concurrency: 6 },
  )
}

await aiForContent()
