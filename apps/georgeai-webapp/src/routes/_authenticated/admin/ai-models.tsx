import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { EditModelButton } from '../../../components/admin/ai-models/edit-model-button'
import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { Pagination } from '../../../components/table/pagination'
import { graphql } from '../../../gql'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { CpuIcon } from '../../../icons/cpu-icon'
import { OllamaLogoIcon } from '../../../icons/ollama-logo-icon'
import { OpenAILogoIcon } from '../../../icons/openai-logo-icon'
import { RefreshIcon } from '../../../icons/refresh-icon'
import { backendRequest } from '../../../server-functions/backend'

// Server functions
const getAiLanguageModels = createServerFn({ method: 'GET' })
  .inputValidator((data: object) =>
    z
      .object({
        skip: z.number().int().min(0).default(0),
        take: z.number().int().min(1).default(20),
        providers: z.array(z.string()).optional(),
        capabilities: z.array(z.string()).optional(),
        onlyUsed: z.boolean().default(false),
        showDisabled: z.boolean().default(false),
      })
      .parse(data),
  )
  .handler(async (ctx) => {
    const result = await backendRequest(
      graphql(`
        query GetAiLanguageModels(
          $skip: Int = 0
          $take: Int = 20
          $providers: [String!]
          $canDoEmbedding: Boolean
          $canDoChatCompletion: Boolean
          $canDoVision: Boolean
          $canDoFunctionCalling: Boolean
          $onlyUsed: Boolean = false
          $showDisabled: Boolean = false
        ) {
          aiLanguageModels(
            skip: $skip
            take: $take
            providers: $providers
            canDoEmbedding: $canDoEmbedding
            canDoChatCompletion: $canDoChatCompletion
            canDoVision: $canDoVision
            canDoFunctionCalling: $canDoFunctionCalling
            onlyUsed: $onlyUsed
            showDisabled: $showDisabled
          ) {
            skip
            take
            count
            enabledCount
            embeddingCount
            providerCount
            models {
              id
              name
              provider
              canDoEmbedding
              canDoChatCompletion
              canDoVision
              canDoFunctionCalling
              enabled
              adminNotes
              lastUsedAt
              createdAt
              librariesUsingAsEmbedding {
                id
                name
              }
              assistantsUsingAsChat {
                id
                name
              }
              listFieldsUsing {
                id
                list {
                  id
                  name
                }
              }
            }
          }
        }
      `),
      {
        skip: ctx.data.skip,
        take: ctx.data.take,
        providers: ctx.data.providers?.length ? ctx.data.providers : undefined,
        canDoEmbedding: ctx.data.capabilities?.includes('embedding') ? true : undefined,
        canDoChatCompletion: ctx.data.capabilities?.includes('chat') ? true : undefined,
        canDoVision: ctx.data.capabilities?.includes('vision') ? true : undefined,
        canDoFunctionCalling: ctx.data.capabilities?.includes('functions') ? true : undefined,
        onlyUsed: ctx.data.onlyUsed,
        showDisabled: ctx.data.showDisabled,
      },
    )
    return result.aiLanguageModels
  })

const syncModels = createServerFn({ method: 'POST' }).handler(async () => {
  return await backendRequest(
    graphql(`
      mutation SyncModels {
        syncModels {
          success
          modelsDiscovered
          errors
        }
      }
    `),
    {},
  )
})

// Search schema for route validation
const aiModelsSearchSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).default(20),
  providers: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  onlyUsed: z.coerce.boolean().default(false),
  showDisabled: z.coerce.boolean().default(false),
})

// Query options
export const aiLanguageModelsQueryOptions = (params: {
  skip: number
  take: number
  providers?: string[]
  capabilities?: string[]
  onlyUsed?: boolean
  showDisabled?: boolean
}) => ({
  queryKey: ['aiLanguageModels', { ...params }],
  queryFn: () =>
    getAiLanguageModels({
      data: {
        skip: params.skip,
        take: params.take,
        providers: params.providers,
        capabilities: params.capabilities,
        onlyUsed: params.onlyUsed ?? false,
        showDisabled: params.showDisabled ?? false,
      },
    }),
})

export const Route = createFileRoute('/_authenticated/admin/ai-models')({
  component: AiModelsPage,
  validateSearch: aiModelsSearchSchema,
  loaderDeps: ({ search }) => search,
  beforeLoad: ({ context }) => {
    if (!context.user?.isAdmin) {
      throw notFound()
    }
    return {}
  },
  loader: async ({ context, deps }) => {
    await context.queryClient.ensureQueryData(aiLanguageModelsQueryOptions(deps))
  },
})

function AiModelsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(aiLanguageModelsQueryOptions(search))
  const models = data?.models ?? []

  // Group models by provider for stats
  const modelsByProvider = models.reduce<Record<string, typeof models>>((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = []
    }
    acc[model.provider].push(model)
    return acc
  }, {})

  // All available providers (for filter checkboxes)
  const allProviders = ['ollama', 'openai']
  const allCapabilities = ['embedding', 'chat', 'vision', 'functions']

  const toggleProvider = (provider: string) => {
    const currentProviders = search.providers || []
    const newProviders = currentProviders.includes(provider)
      ? currentProviders.filter((p) => p !== provider)
      : [...currentProviders, provider]
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        providers: newProviders.length > 0 ? newProviders : undefined,
        skip: 0,
      }),
    })
  }

  const toggleCapability = (capability: string) => {
    const currentCapabilities = search.capabilities || []
    const newCapabilities = currentCapabilities.includes(capability)
      ? currentCapabilities.filter((c) => c !== capability)
      : [...currentCapabilities, capability]
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        capabilities: newCapabilities.length > 0 ? newCapabilities : undefined,
        skip: 0,
      }),
    })
  }

  const toggleOnlyUsed = () => {
    navigate({ from: Route.fullPath, search: (prev) => ({ ...prev, onlyUsed: !search.onlyUsed, skip: 0 }) })
  }

  const toggleShowDisabled = () => {
    navigate({ from: Route.fullPath, search: (prev) => ({ ...prev, showDisabled: !search.showDisabled, skip: 0 }) })
  }

  const syncMutation = useMutation({
    mutationFn: () => syncModels(),
    onSuccess: (data) => {
      if (data.syncModels?.success) {
        toastSuccess(
          t('admin.aiModels.syncSuccess', {
            count: data.syncModels.modelsDiscovered.toString(),
          }),
        )
        queryClient.invalidateQueries({ queryKey: ['aiLanguageModels'] })
      } else {
        toastError(
          <div>
            <div>{t('admin.aiModels.syncFailed')}</div>
            {data.syncModels?.errors.map((error: string) => (
              <div key={error} className="mt-1 text-xs">
                {error}
              </div>
            ))}
          </div>,
        )
      }
    },
    onError: (error: Error) => {
      toastError(error.message)
    },
  })

  return (
    <div className="bg-linear-to-br from-base-200 via-base-100 to-base-200 grid h-full w-full grid-rows-[auto_1fr]">
      <div>
        <div className="container mx-auto px-6 py-4">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-primary mb-2 text-4xl font-bold">{t('admin.manageAiModels')}</h1>
              <p className="text-lg opacity-80">{t('admin.manageAiModelsDescription')}</p>
            </div>
            <button
              type="button"
              onClick={() => syncMutation.mutate()}
              disabled={syncMutation.isPending}
              className={twMerge('btn btn-primary', syncMutation.isPending && 'loading')}
            >
              {!syncMutation.isPending && <RefreshIcon className="h-5 w-5" />}
              {t('admin.aiModels.syncModels')}
            </button>
          </div>

          {/* Stats */}
          <div className="mb-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="card border-base-300 bg-base-100 border shadow-lg">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60">{t('admin.aiModels.totalModels')}</p>
                    <p className="text-3xl font-bold">{data.count}</p>
                  </div>
                  <CpuIcon className="h-12 w-12 opacity-30" />
                </div>
              </div>
            </div>

            <div className="card border-base-300 bg-base-100 border shadow-lg">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60">{t('admin.aiModels.enabledModels')}</p>
                    <p className="text-success text-3xl font-bold">{data.enabledCount}</p>
                  </div>
                  <div className="badge badge-success badge-lg">{t('admin.aiModels.enabled')}</div>
                </div>
              </div>
            </div>

            <div className="card border-base-300 bg-base-100 border shadow-lg">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60">{t('admin.aiModels.providers')}</p>
                    <p className="text-3xl font-bold">{data.providerCount}</p>
                  </div>
                  <div className="flex gap-2">
                    {Object.keys(modelsByProvider).map((provider) => {
                      if (provider === 'ollama') {
                        return (
                          <div key={provider} className="tooltip" data-tip="Ollama">
                            <a
                              href="https://ollama.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block transition-all hover:scale-110 hover:opacity-100"
                            >
                              <OllamaLogoIcon className="h-10 w-10 opacity-70" />
                            </a>
                          </div>
                        )
                      }
                      if (provider === 'openai') {
                        return (
                          <div key={provider} className="tooltip" data-tip="OpenAI">
                            <a
                              href="https://openai.com/"
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-block transition-all hover:scale-110 hover:opacity-100"
                            >
                              <OpenAILogoIcon className="h-10 w-10 opacity-70" />
                            </a>
                          </div>
                        )
                      }
                      return null
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-base-300 bg-base-100 border shadow-lg">
              <div className="card-body p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm opacity-60">{t('admin.aiModels.embeddingModels')}</p>
                    <p className="text-info text-3xl font-bold">{data.embeddingCount}</p>
                  </div>
                  <div className="badge badge-info badge-lg">{t('admin.aiModels.embedding')}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex w-full items-center justify-between">
          <div className="flex gap-2">
            {allProviders.map((provider) => (
              <label key={provider} className="label cursor-pointer justify-start gap-2 py-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={search.providers?.includes(provider) ?? false}
                  onChange={() => toggleProvider(provider)}
                />
                <span className="label-text capitalize">{provider}</span>
              </label>
            ))}

            {allCapabilities.map((capability) => (
              <label key={capability} className="label cursor-pointer justify-start gap-2 py-1">
                <input
                  type="checkbox"
                  className="checkbox checkbox-sm"
                  checked={search.capabilities?.includes(capability) ?? false}
                  onChange={() => toggleCapability(capability)}
                />
                <span className="label-text capitalize">{capability}</span>
              </label>
            ))}

            <label className="label cursor-pointer justify-start gap-2 py-1">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={search.onlyUsed}
                onChange={toggleOnlyUsed}
              />
              <span className="label-text">Only Used</span>
            </label>
            <label className="label cursor-pointer justify-start gap-2 py-1">
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                checked={search.showDisabled}
                onChange={toggleShowDisabled}
              />
              <span className="label-text">Show Disabled</span>
            </label>
          </div>
          <div>
            {/* Pagination Info */}
            <Pagination
              totalItems={data.count}
              itemsPerPage={data.take}
              currentPage={1 + data.skip / data.take}
              onPageChange={(page) => {
                navigate({ from: Route.fullPath, search: (prev) => ({ ...prev, skip: (page - 1) * data.take }) })
              }}
              showPageSizeSelector={true}
              onPageSizeChange={(newPageSize) => {
                navigate({ from: Route.fullPath, search: (prev) => ({ ...prev, skip: 0, take: newPageSize }) })
              }}
            />
          </div>
        </div>
      </div>

      <div className="min-h-0 min-w-0">
        <div className="h-full w-full overflow-auto">
          <table className="table-zebra table-sm table-pin-rows table-pin-cols table">
            <thead>
              <tr>
                <th>{t('admin.aiModels.provider')}</th>
                <th>{t('admin.aiModels.name')}</th>
                <td>{t('admin.aiModels.capabilities')}</td>
                <td>{t('admin.aiModels.status')}</td>
                <td>{t('admin.aiModels.usedIn')}</td>
                <td>{t('admin.aiModels.lastUsed')}</td>
                <td>{t('admin.aiModels.actions')}</td>
              </tr>
            </thead>
            <tbody>
              {models.map((model) => (
                <tr key={model.id}>
                  <th>
                    <div className="flex items-center gap-2">
                      {model.provider === 'ollama' && <OllamaLogoIcon className="h-5 w-5" />}
                      {model.provider === 'openai' && <OpenAILogoIcon className="h-5 w-5" />}
                      <span className="font-mono font-semibold">{model.provider}</span>
                    </div>
                  </th>
                  <th>
                    <div className="flex flex-col">
                      <span className="font-mono font-semibold">{model.name}</span>
                      {model.adminNotes && <span className="text-xs opacity-60">{model.adminNotes}</span>}
                    </div>
                  </th>
                  <td>
                    <div className="flex flex-wrap gap-1">
                      {model.canDoChatCompletion && <div className="badge badge-sm badge-primary">Chat</div>}
                      {model.canDoEmbedding && <div className="badge badge-sm badge-info">Embedding</div>}
                      {model.canDoVision && <div className="badge badge-sm badge-secondary">Vision</div>}
                      {model.canDoFunctionCalling && <div className="badge badge-sm badge-accent">Functions</div>}
                    </div>
                  </td>
                  <td>
                    {model.enabled ? (
                      <div className="badge badge-sm badge-success">{t('admin.aiModels.enabled')}</div>
                    ) : (
                      <div className="badge badge-sm badge-error">{t('admin.aiModels.disabled')}</div>
                    )}
                  </td>
                  <td>
                    <div className="flex flex-col gap-1">
                      {(model.librariesUsingAsEmbedding?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {model.librariesUsingAsEmbedding?.map((library) => (
                            <Link
                              key={library.id}
                              to="/libraries/$libraryId"
                              params={{ libraryId: library.id }}
                              className="badge badge-sm badge-info hover:badge-info-content"
                            >
                              {library.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      {(model.assistantsUsingAsChat?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {model.assistantsUsingAsChat?.map((assistant) => (
                            <Link
                              key={assistant.id}
                              to="/assistants/$assistantId"
                              params={{ assistantId: assistant.id }}
                              className="badge badge-sm badge-primary hover:badge-primary-content"
                            >
                              {assistant.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      {(model.listFieldsUsing?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {model.listFieldsUsing?.map((field) => (
                            <Link
                              key={field.id}
                              to="/lists/$listId"
                              params={{ listId: field.list.id }}
                              className="badge badge-sm badge-accent hover:badge-accent-content"
                            >
                              {field.list.name}
                            </Link>
                          ))}
                        </div>
                      )}
                      {(model.librariesUsingAsEmbedding?.length ?? 0) === 0 &&
                        (model.assistantsUsingAsChat?.length ?? 0) === 0 &&
                        (model.listFieldsUsing?.length ?? 0) === 0 && (
                          <span className="text-xs opacity-40">{t('admin.aiModels.notUsed')}</span>
                        )}
                    </div>
                  </td>
                  <td>
                    <span className="text-sm opacity-60">
                      {model.lastUsedAt ? new Date(model.lastUsedAt).toLocaleString() : t('admin.aiModels.neverUsed')}
                    </span>
                  </td>
                  <td>
                    <div className="flex gap-2">
                      <EditModelButton model={model} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
