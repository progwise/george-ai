import { queryOptions } from '@tanstack/react-query'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'

import { graphql } from '../../../gql'
import { backendRequest } from '../../../server-functions/backend'

const getUsageStats = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        period: z.enum(['week', 'month', 'year']).default('month'),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const now = new Date()
    const startDate = new Date()

    // Calculate start date based on period
    if (ctx.data.period === 'week') {
      startDate.setDate(now.getDate() - 7)
    } else if (ctx.data.period === 'month') {
      startDate.setMonth(now.getMonth() - 1)
    } else {
      startDate.setFullYear(now.getFullYear() - 1)
    }

    const result = await backendRequest(
      graphql(`
        query GetUsageStats($startDate: DateTime, $endDate: DateTime) {
          aiModelUsageStats(startDate: $startDate, endDate: $endDate) {
            totalRequests
            totalTokensInput
            totalTokensOutput
            totalDurationMs
            avgTokensInput
            avgTokensOutput
            avgDurationMs
          }
        }
      `),
      {
        startDate,
        endDate: now,
      },
    )

    // Ensure we always return a value (GraphQL field is nullable)
    return (
      result.aiModelUsageStats ?? {
        totalRequests: 0,
        totalTokensInput: 0,
        totalTokensOutput: 0,
        totalDurationMs: 0,
        avgTokensInput: 0,
        avgTokensOutput: 0,
        avgDurationMs: 0,
      }
    )
  })

export const usageStatsQueryOptions = (period: 'week' | 'month' | 'year') =>
  queryOptions({
    queryKey: ['usageStats', period],
    queryFn: () => getUsageStats({ data: { period } }),
  })
