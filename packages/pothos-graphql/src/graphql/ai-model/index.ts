import { builder } from '../builder'

console.log('Setting up: AiModels')

const AiModelOption = builder.objectRef<{ key: string; value: string }>('AiModelOption').implement({
  description: 'Options for AI Models',
  fields: (t) => ({
    key: t.exposeString('key', { nullable: false }),
    value: t.exposeString('value', { nullable: false }),
  }),
})

const AiModel = builder
  .objectRef<{
    modelName: string
    title: string
    type: string
    baseUrl?: string
    options: Record<string, string>[]
  }>('AiModel')
  .implement({
    description: 'AI Models available in the system',
    fields: (t) => ({
      modelName: t.exposeString('modelName', { nullable: false }),
      title: t.exposeString('title', { nullable: false }),
      modelType: t.exposeString('type', { nullable: false }),
      baseUrl: t.exposeString('baseUrl', { nullable: true }),
      options: t.field({
        nullable: true,
        type: [AiModelOption],
        resolve: (source) => {
          return source.options.map((option) => ({
            key: option.key,
            value: option.value,
          }))
        },
      }),
    }),
  })

builder.queryField('aiModels', (t) =>
  t.field({
    type: [AiModel],
    nullable: false,
    resolve: async () => {
      // This should be replaced with actual data fetching logic
      const models = [
        {
          modelName: 'gpt-4o-mini',
          title: 'GPT-4 Mini',
          type: 'OpenAI',
          options: [
            { key: 'temperature', value: '0.7' },
            { key: 'maxTokens', value: '80000' },
          ],
          baseUrl: undefined as string | undefined,
        },
        {
          modelName: 'gemini-1.5-pro',
          title: 'Gemini 1.5 Pro',
          type: 'Google',
          options: [
            { key: 'temperature', value: '0.0' },
            { key: 'maxRetries', value: '2' },
          ],
          baseUrl: undefined,
        },
      ]

      if (process.env.OLLAMA_BASE_URL && process.env.OLLAMA_BASE_URL.length > 0) {
        const ollamaModelsResponse = await fetch(`${process.env.OLLAMA_BASE_URL}/api/tags`)
        if (!ollamaModelsResponse.ok) {
          throw new Error('Failed to fetch OLLAMA models')
        }
        const ollamaModelsContent = await ollamaModelsResponse.json()
        ollamaModelsContent.models.forEach((model: { name: string; model: string }) => {
          models.push({
            modelName: model.name,
            title: model.model,
            type: 'Ollama',
            baseUrl: process.env.OLLAMA_BASE_URL,
            options: [
              { key: 'temperature', value: '0.7' },
              { key: 'maxTokens', value: '80000' },
            ],
          })
        })
      }

      return models
    },
  }),
)
