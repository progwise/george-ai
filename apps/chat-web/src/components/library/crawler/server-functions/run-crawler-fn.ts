import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../../gql'
import { backendRequest } from '../../../../server-functions/backend'

export const runCrawlerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: { crawlerId: string }) =>
    z
      .object({
        crawlerId: z.string().nonempty(),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        mutation runCrawler($crawlerId: String!) {
          runAiLibraryCrawler(crawlerId: $crawlerId)
        }
      `),
      { crawlerId: ctx.data.crawlerId },
    )
    return result.runAiLibraryCrawler
  })
