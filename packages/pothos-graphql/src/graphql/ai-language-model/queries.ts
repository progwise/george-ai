import { prisma } from '../../prisma'
import { builder } from '../builder'

console.log('Setting up: AiLanguageModel Queries')

builder.queryField('aiLanguageModels', (t) =>
  t.prismaField({
    type: ['AiLanguageModel'],
    nullable: false,
    args: {
      canDoEmbedding: t.arg.boolean({ required: false }),
      canDoChatCompletion: t.arg.boolean({ required: false }),
    },
    resolve: async (query, _parent, args) => {
      return prisma.aiLanguageModel.findMany({
        ...query,
        where: {
          enabled: true,
          deleted: false,
          ...(args.canDoEmbedding !== undefined &&
            args.canDoEmbedding !== null && { canDoEmbedding: args.canDoEmbedding }),
          ...(args.canDoChatCompletion !== undefined &&
            args.canDoChatCompletion !== null && { canDoChatCompletion: args.canDoChatCompletion }),
        },
        orderBy: [{ provider: 'asc' }, { name: 'asc' }],
      })
    },
  }),
)

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

const ModelUsageByProvider = builder.simpleObject('ModelUsageByProvider', {
  fields: (t) => ({
    provider: t.string({ nullable: false }),
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
  }),
})

const ModelUsageByModel = builder.simpleObject('ModelUsageByModel', {
  fields: (t) => ({
    modelId: t.string({ nullable: false }),
    modelName: t.string({ nullable: false }),
    provider: t.string({ nullable: false }),
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
  }),
})

const ModelUsageByType = builder.simpleObject('ModelUsageByType', {
  fields: (t) => ({
    usageType: t.string({ nullable: false }),
    totalRequests: t.int({ nullable: false }),
    totalTokensInput: t.int({ nullable: false }),
    totalTokensOutput: t.int({ nullable: false }),
  }),
})

// Query: Get usage statistics with filters
builder.queryField('aiModelUsageStats', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: ModelUsageStats,
    args: {
      modelId: t.arg.string({ required: false }),
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      assistantId: t.arg.string({ required: false }),
      listId: t.arg.string({ required: false }),
      usageType: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      // Admin sees all, users see only their own usage
      const where = {
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
        // Non-admin users can only see their own usage
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        // Admin can filter by specific user
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
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

// Query: Usage breakdown by provider
builder.queryField('aiModelUsageByProvider', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ModelUsageByProvider],
    nullable: { list: false, items: false },
    args: {
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      const where = {
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
      }

      const results = await prisma.aiModelUsage.groupBy({
        by: ['providerName'],
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
        },
        orderBy: {
          _sum: {
            requestCount: 'desc',
          },
        },
      })

      return results.map((r) => ({
        provider: r.providerName,
        totalRequests: r._sum.requestCount || 0,
        totalTokensInput: r._sum.tokensInput || 0,
        totalTokensOutput: r._sum.tokensOutput || 0,
      }))
    },
  }),
)

// Query: Usage breakdown by model
builder.queryField('aiModelUsageByModel', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ModelUsageByModel],
    nullable: { list: false, items: false },
    args: {
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      provider: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      const where = {
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.provider && { providerName: args.provider }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
      }

      const results = await prisma.aiModelUsage.groupBy({
        by: ['modelId', 'modelName', 'providerName'],
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
        },
        orderBy: {
          _sum: {
            requestCount: 'desc',
          },
        },
      })

      return results.map((r) => ({
        modelId: r.modelId,
        modelName: r.modelName,
        provider: r.providerName,
        totalRequests: r._sum.requestCount || 0,
        totalTokensInput: r._sum.tokensInput || 0,
        totalTokensOutput: r._sum.tokensOutput || 0,
      }))
    },
  }),
)

// Query: Usage breakdown by type (chat, embedding, vision, enrichment)
builder.queryField('aiModelUsageByType', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: [ModelUsageByType],
    nullable: { list: false, items: false },
    args: {
      userId: t.arg.string({ required: false }),
      libraryId: t.arg.string({ required: false }),
      startDate: t.arg({ type: 'DateTime', required: false }),
      endDate: t.arg({ type: 'DateTime', required: false }),
    },
    resolve: async (_parent, args, ctx) => {
      const where = {
        ...(args.libraryId && { libraryId: args.libraryId }),
        ...(args.startDate || args.endDate
          ? {
              createdAt: {
                ...(args.startDate && { gte: args.startDate }),
                ...(args.endDate && { lte: args.endDate }),
              },
            }
          : {}),
        ...(!ctx.session.user.isAdmin && { userId: ctx.session.user.id }),
        ...(ctx.session.user.isAdmin && args.userId && { userId: args.userId }),
      }

      const results = await prisma.aiModelUsage.groupBy({
        by: ['usageType'],
        where,
        _sum: {
          requestCount: true,
          tokensInput: true,
          tokensOutput: true,
        },
        orderBy: {
          _sum: {
            requestCount: 'desc',
          },
        },
      })

      return results.map((r) => ({
        usageType: r.usageType,
        totalRequests: r._sum.requestCount || 0,
        totalTokensInput: r._sum.tokensInput || 0,
        totalTokensOutput: r._sum.tokensOutput || 0,
      }))
    },
  }),
)
