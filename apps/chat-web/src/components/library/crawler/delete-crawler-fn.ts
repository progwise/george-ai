import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

export const deleteCrawlerFn = createServerFn({ method: 'POST' })
  .inputValidator((data: string) => z.string().nonempty().parse(data))
  .handler(async (ctx) => {
    return await backendRequest(
      graphql(`
        mutation deleteCrawler($id: String!) {
          deleteAiLibraryCrawler(id: $id) {
            id
          }
        }
      `),
      { id: ctx.data },
    )
  })
