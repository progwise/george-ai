import { prisma } from '../../prisma'
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
  t.field({
    type: AiServiceClusterStatus,
    nullable: false,
    authScopes: {
      isLoggedIn: true,
    },
    resolve: async (_parent, _args, context) => {
      try {
        // Get workspace-scoped Ollama providers from database
        const providers = await prisma.aiServiceProvider.findMany({
          where: {
            workspaceId: context.workspaceId,
            provider: 'ollama',
            enabled: true,
          },
        })

        // If no providers configured, return empty status
        if (providers.length === 0) {
          return {
            instances: [],
            totalInstances: 0,
            availableInstances: 0,
            healthyInstances: 0,
            totalMemory: 0,
            totalUsedMemory: 0,
            totalMaxConcurrency: 0,
            totalQueueLength: 0,
          }
        }

        // TODO: Fetch real-time status from each provider's baseUrl
        // For now, return basic provider info
        // This will be implemented in the next step
        const instances = providers.map((provider) => ({
          name: provider.name,
          url: provider.baseUrl || 'http://ollama:11434',
          type: 'OLLAMA',
          isOnline: false, // TODO: Query actual status
          version: '',
          availableModels: [],
          runningModels: [],
          modelQueues: [],
          totalVram: (provider.vramGb || 16) * 1024 * 1024 * 1024,
          usedVram: 0,
        }))

        return {
          instances,
          totalInstances: instances.length,
          availableInstances: 0, // TODO: Count online instances
          healthyInstances: 0,
          totalMemory: instances.reduce((sum, inst) => sum + inst.totalVram, 0),
          totalUsedMemory: 0,
          totalMaxConcurrency: 0,
          totalQueueLength: 0,
        }
      } catch (error) {
        console.error('Error fetching AI service status:', error)
        throw new Error('Failed to fetch AI service status')
      }
    },
  }),
)
