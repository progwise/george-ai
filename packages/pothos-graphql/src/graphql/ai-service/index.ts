import { getAiServiceClusterStatus } from '@george-ai/ai-service-client'

import { builder } from '../builder'

// Enum for AI service types
const AiServiceType = builder.enumType('AiServiceType', {
  values: {
    OLLAMA: {},
    OPENAI: {},
    ANTHROPIC: {},
    GEMINI: {},
  },
})

// Generic AI model information
const AiModelInfo = builder.simpleObject('AiModelInfo', {
  fields: (t) => ({
    name: t.string({ nullable: false }),
    size: t.float({ nullable: true }),
    digest: t.string({ nullable: true }),
    parameterSize: t.string({ nullable: true }),
    quantizationLevel: t.string({ nullable: true }),
    family: t.string({ nullable: true }),
    capabilities: t.stringList({ nullable: { list: false, items: false } }),
  }),
})

// Currently running models
const AiRunningModel = builder.simpleObject('AiRunningModel', {
  fields: (t) => ({
    name: t.string({ nullable: false }),
    size: t.float({ nullable: true }),
    memoryUsage: t.float({ nullable: true }),
    expiresAt: t.string({ nullable: true }),
    processingLoad: t.string({ nullable: true }),
    activeRequests: t.int({ nullable: true }),
  }),
})

// Memory/resource usage information
const AiResourceUsage = builder.simpleObject('AiResourceUsage', {
  fields: (t) => ({
    totalMemory: t.float({ nullable: false }),
    usedMemory: t.float({ nullable: false }),
    availableMemory: t.float({ nullable: false }),
    safeMemory: t.float({ nullable: false }),
    maxConcurrency: t.int({ nullable: false }),
    estimatedRequestMemory: t.float({ nullable: false }),
    utilizationPercentage: t.float({ nullable: false }),
    memoryType: t.string({ nullable: false }), // "GPU", "CPU", "Mixed"
  }),
})

// Individual AI service instance status
const AiServiceInstance = builder.simpleObject('AiServiceInstance', {
  fields: (t) => ({
    id: t.string({ nullable: false }),
    url: t.string({ nullable: false }),
    type: t.field({ type: AiServiceType, nullable: false }),
    available: t.boolean({ nullable: false }),
    responseTime: t.float({ nullable: true }),
    loadScore: t.float({ nullable: true }),
    runningModels: t.field({
      type: [AiRunningModel],
      nullable: { list: true, items: false },
    }),
    availableModels: t.field({
      type: [AiModelInfo],
      nullable: { list: true, items: false },
    }),
    resourceUsage: t.field({
      type: AiResourceUsage,
      nullable: true,
    }),
    currentConcurrency: t.int({ nullable: false }),
    queueLength: t.int({ nullable: false }),
    maxQueueLength: t.int({ nullable: true }),
    version: t.string({ nullable: true }),
    error: t.string({ nullable: true }),
    metadata: t.string({ nullable: true }), // JSON string for service-specific data
  }),
})

// Overall cluster status
const AiServiceClusterStatus = builder.simpleObject('AiServiceClusterStatus', {
  fields: (t) => ({
    instances: t.field({
      type: [AiServiceInstance],
      nullable: { list: false, items: false },
    }),
    totalInstances: t.int({ nullable: false }),
    availableInstances: t.int({ nullable: false }),
    healthyInstances: t.int({ nullable: false }),
    totalMemory: t.float({ nullable: false }),
    totalUsedMemory: t.float({ nullable: false }),
    totalMaxConcurrency: t.int({ nullable: false }),
    bestInstanceId: t.string({ nullable: true }),
    serviceTypes: t.field({
      type: [AiServiceType],
      nullable: { list: false, items: false },
    }),
    lastUpdated: t.field({ type: 'DateTime', nullable: false }),
  }),
})

// Query resolver for AI service status
builder.queryField('aiServiceStatus', (t) =>
  t.field({
    type: AiServiceClusterStatus,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    resolve: async (_, __, { session }) => {
      // Only allow admin users to access this information
      if (!session?.user?.isAdmin) {
        throw new Error('Admin access required')
      }

      try {
        return await getAiServiceClusterStatus()
      } catch (error) {
        console.error('Error fetching AI service status:', error)
        throw new Error('Failed to fetch AI service status')
      }
    },
  }),
)
