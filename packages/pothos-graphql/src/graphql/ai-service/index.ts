import { builder } from '../builder'

// Generic AI model information
const AiModelInfo = builder.simpleObject('AiModelInfo', {
  fields: (t) => ({
    name: t.string({ nullable: false }),
    size: t.float({ nullable: false }),
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
    size: t.float({ nullable: false }),
    expiresAt: t.string({ nullable: false }),
    activeRequests: t.int({ nullable: false }),
  }),
})

const AiModelQueue = builder.simpleObject('AiModelQueue', {
  fields: (t) => ({
    modelName: t.string({ nullable: false }),
    queueLength: t.int({ nullable: false }),
    maxConcurrency: t.int({ nullable: false }),
    estimatedRequestSize: t.float({ nullable: false }),
  }),
})

// Individual AI service instance status
const AiServiceInstance = builder.simpleObject('AiServiceInstance', {
  fields: (t) => ({
    name: t.string({ nullable: false }),
    url: t.string({ nullable: false }),
    type: t.string({ nullable: false }),
    isOnline: t.boolean({ nullable: false }),
    version: t.string({ nullable: false }),
    runningModels: t.field({
      type: [AiRunningModel],
      nullable: { list: true, items: false },
    }),
    availableModels: t.field({
      type: [AiModelInfo],
      nullable: { list: true, items: false },
    }),
    modelQueues: t.field({
      type: [AiModelQueue],
      nullable: { list: true, items: false },
    }),
    totalVram: t.float({ nullable: false }),
    usedVram: t.float({ nullable: false }),
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
    totalQueueLength: t.int({ nullable: false }),
  }),
})

// Query resolver for AI service status (workspace-scoped)
builder.queryField('aiServiceStatus', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: AiServiceClusterStatus,
    nullable: false,
    resolve: async (_parent, _args, context) => {
      try {
        const { getOllamaClusterStatus } = await import('@george-ai/ai-service-client')
        return getOllamaClusterStatus(context.workspaceId)
      } catch (error) {
        console.error('Error fetching AI service status:', error)
        throw new Error('Failed to fetch AI service status')
      }
    },
  }),
)
