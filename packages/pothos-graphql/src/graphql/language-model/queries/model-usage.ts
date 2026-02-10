import { prisma } from '@george-ai/app-database'
import { canWriteWorkspaceOrThrow } from '@george-ai/app-domain'

import { builder } from '../../builder'

console.log('Setting up: AiLanguageModel Queries')

// Usage tracking query result types
const ModelUsageStats = builder.simpleObject('ModelUsageStats', {
  fields: (t) => ({
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
    totalDurationMs: t.int({ nullable: false }),
    avgTokensInput: t.float({ nullable: false }),
    avgTokensOutput: t.float({ nullable: false }),
    avgDurationMs: t.float({ nullable: false }),
  }),
})

// Query: Get usage statistics with filters
builder.queryField('aiModelUsageStats', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ModelUsageStats,
    args: {
      modelId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      assistantId: t.arg.string({ required: false }),
      listId: t.arg.string({ required: false }),
      usageType: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      await canWriteWorkspaceOrThrow(ctx.workspaceId, ctx.session.user.id)

      const where = {
        model: {
          workspaceId: ctx.workspaceId,
        },
        ...(args.modelId && { modelId: args.modelId }),
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.assistantId && { assistantId: args.assistantId }),
        ...(args.listId && { listId: args.listId }),
        ...(args.usageType && { usageType: args.usageType }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
      }

      const aggregation = await prisma.aiModelUsage.aggregate({
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
          durationMs: true,
        },
        _avg: {
          tokensInput: true,
          tokensOutput: true,
          durationMs: true,
        },
      })

      return {
        totalRequests: aggregation._sum.requestCount || 0,
        totalTokensInput: aggregation._sum.tokensInput || 0,
        totalTokensOutput: aggregation._sum.tokensOutput || 0,
        totalDurationMs: aggregation._sum.durationMs || 0,
        avgTokensInput: aggregation._avg.tokensInput || 0,
        avgTokensOutput: aggregation._avg.tokensOutput || 0,
        avgDurationMs: aggregation._avg.durationMs || 0,
      }
    },
  }),
)
