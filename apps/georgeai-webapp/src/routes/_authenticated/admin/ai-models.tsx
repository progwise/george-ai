import { useMutation, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { Link, createFileRoute, notFound, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { z } from 'zod'

import { EditModelButton } from '../../../components/admin/ai-models/edit-model-button'
import { aiLanguageModelsQueryOptions } from '../../../components/admin/ai-models/get-language-models'
import { usageStatsQueryOptions } from '../../../components/admin/ai-models/get-usage-stats'
import { syncModels } from '../../../components/admin/ai-models/mutate-sync-models'
import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { Pagination } from '../../../components/table/pagination'
import { useTranslation } from '../../../i18n/use-translation-hook'
import { BowlerLogoIcon } from '../../../icons/bowler-logo-icon'
import { OllamaLogoIcon } from '../../../icons/ollama-logo-icon'
import { OpenAILogoIcon } from '../../../icons/openai-logo-icon'
import { RefreshIcon } from '../../../icons/refresh-icon'

// Search schema for route validation
const aiModelsSearchSchema = z.object({
  skip: z.coerce.number().int().min(0).default(0),
  take: z.coerce.number().int().min(1).default(20),
  providers: z.array(z.string()).optional(),
  capabilities: z.array(z.string()).optional(),
  onlyUsed: z.coerce.boolean().default(false),
  showDisabled: z.coerce.boolean().default(false),
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

// Helper component for capability badges
function CapabilityBadges({
  embeddingCount,
  chatCount,
  visionCount,
  functionCount,
  provider,
  onFilterByCapability,
}: {
  embeddingCount: number
  chatCount: number
  visionCount: number
  functionCount: number
  provider?: string
  onFilterByCapability: (capability: string, provider?: string) => void
}) {
  return (
    <div className="flex flex-wrap gap-1">
      <button
        type="button"
        onClick={() => onFilterByCapability('embedding', provider)}
        className="badge badge-info badge-xs cursor-pointer whitespace-nowrap transition-opacity hover:opacity-80"
      >
        {embeddingCount} emb
      </button>
      <button
        type="button"
        onClick={() => onFilterByCapability('chat', provider)}
        className="badge badge-primary badge-xs cursor-pointer whitespace-nowrap transition-opacity hover:opacity-80"
      >
        {chatCount} chat
      </button>
      <button
        type="button"
        onClick={() => onFilterByCapability('vision', provider)}
        className="badge badge-secondary badge-xs cursor-pointer whitespace-nowrap transition-opacity hover:opacity-80"
      >
        {visionCount} vis
      </button>
      <button
        type="button"
        onClick={() => onFilterByCapability('functions', provider)}
        className="badge badge-accent badge-xs cursor-pointer whitespace-nowrap transition-opacity hover:opacity-80"
      >
        {functionCount} fn
      </button>
    </div>
  )
}

function AiModelsPage() {
  const { t } = useTranslation()
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const search = Route.useSearch()
  const { data } = useSuspenseQuery(aiLanguageModelsQueryOptions(search))
  const models = data?.models ?? []

  // Usage period state (last week, last month, last year)
  const [usagePeriod, setUsagePeriod] = useState<'week' | 'month' | 'year'>('month')
  const { data: usageStats } = useSuspenseQuery(usageStatsQueryOptions(usagePeriod))

  // All available providers (for filter checkboxes)
  const allProviders = ['ollama', 'openai']
  const allCapabilities = ['embedding', 'chat', 'vision', 'functions']

  // Helper to navigate with capability filter
  const filterByCapability = (capability: string, provider?: string) => {
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        capabilities: [capability],
        ...(provider && { providers: [provider] }),
        skip: 0,
      }),
    })
  }

  // Helper for Total Models card - clears provider filter
  const filterByCapabilityAllProviders = (capability: string) => {
    navigate({
      from: Route.fullPath,
      search: (prev) => ({
        ...prev,
        capabilities: [capability],
        providers: undefined, // Clear providers filter to show all
        skip: 0,
      }),
    })
  }

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
            {/* Models Overview Card */}
            <div className="card border-base-300 bg-base-100 border shadow-lg">
              <div className="card-body p-6">
                <div className="flex flex-col gap-3">
                  {/* Header with Logo */}
                  <div className="flex items-center gap-2">
                    <BowlerLogoIcon className="h-6 w-6" />
                    <span className="text-sm font-bold">{t('admin.aiModels.totalModels')}</span>
                  </div>

                  {/* Counts */}
                  <div className="flex items-baseline gap-3">
                    <div>
                      <p className="text-2xl font-bold">
                        {data.providerCapabilities.reduce(
                          (sum: number, p) => sum + p.enabledCount + p.disabledCount,
                          0,
                        )}
                      </p>
                      <p className="text-xs opacity-50">Total</p>
                    </div>
                    <div>
                      <p className="text-success text-xl font-bold">
                        {data.providerCapabilities.reduce((sum: number, p) => sum + p.enabledCount, 0)}
                      </p>
                      <p className="text-xs opacity-50">{t('admin.aiModels.enabled')}</p>
                    </div>
                    <div>
                      <p className="text-error text-xl font-bold">
                        {data.providerCapabilities.reduce((sum: number, p) => sum + p.disabledCount, 0)}
                      </p>
                      <p className="text-xs opacity-50">Disabled</p>
                    </div>
                  </div>

                  {/* Capability Badges */}
                  <CapabilityBadges
                    embeddingCount={data.providerCapabilities.reduce((sum: number, p) => sum + p.embeddingCount, 0)}
                    chatCount={data.providerCapabilities.reduce((sum: number, p) => sum + p.chatCount, 0)}
                    visionCount={data.providerCapabilities.reduce((sum: number, p) => sum + p.visionCount, 0)}
                    functionCount={data.providerCapabilities.reduce((sum: number, p) => sum + p.functionCount, 0)}
                    onFilterByCapability={filterByCapabilityAllProviders}
                  />
                </div>
              </div>
            </div>

            {/* Ollama Card - Aggregated from all Ollama providers */}
            {(() => {
              const ollamaData = data.providerCapabilities.find((p) => p.provider === 'ollama')
              if (!ollamaData) return null

              return (
                <div key="ollama" className="card border-base-300 bg-base-100 border shadow-lg">
                  <div className="card-body p-6">
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center gap-2">
                        <OllamaLogoIcon className="h-6 w-6" />
                        <span className="text-sm font-bold">Ollama</span>
                      </div>
                      <div className="flex items-baseline gap-3">
                        <div>
                          <p className="text-2xl font-bold">
                            {ollamaData.enabledCount + ollamaData.disabledCount}
                          </p>
                          <p className="text-xs opacity-50">Total</p>
                        </div>
                        <div>
                          <p className="text-success text-xl font-bold">{ollamaData.enabledCount}</p>
                          <p className="text-xs opacity-50">Enabled</p>
                        </div>
                        <div>
                          <p className="text-error text-xl font-bold">{ollamaData.disabledCount}</p>
                          <p className="text-xs opacity-50">Disabled</p>
                        </div>
                      </div>
                      <CapabilityBadges
                        embeddingCount={ollamaData.embeddingCount}
                        chatCount={ollamaData.chatCount}
                        visionCount={ollamaData.visionCount}
                        functionCount={ollamaData.functionCount}
                        provider="ollama"
                        onFilterByCapability={filterByCapability}
                      />
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Cards for other provider types (OpenAI, etc.) */}
            {data.providerCapabilities
              .filter((p) => p.provider !== 'ollama')
              .map((providerData) => {
                const getProviderIcon = (provider: string) => {
                  switch (provider) {
                    case 'openai':
                      return <OpenAILogoIcon className="h-6 w-6" />
                    default:
                      return null
                  }
                }

                const getProviderLabel = (provider: string) => {
                  switch (provider) {
                    case 'openai':
                      return 'OpenAI'
                    default:
                      return provider
                  }
                }

                return (
                  <div key={providerData.provider} className="card border-base-300 bg-base-100 border shadow-lg">
                    <div className="card-body p-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-center gap-2">
                          {getProviderIcon(providerData.provider)}
                          <span className="text-sm font-bold">{getProviderLabel(providerData.provider)}</span>
                        </div>
                        <div className="flex items-baseline gap-3">
                          <div>
                            <p className="text-2xl font-bold">
                              {providerData.enabledCount + providerData.disabledCount}
                            </p>
                            <p className="text-xs opacity-50">Total</p>
                          </div>
                          <div>
                            <p className="text-success text-xl font-bold">{providerData.enabledCount}</p>
                            <p className="text-xs opacity-50">Enabled</p>
                          </div>
                          <div>
                            <p className="text-error text-xl font-bold">{providerData.disabledCount}</p>
                            <p className="text-xs opacity-50">Disabled</p>
                          </div>
                        </div>
                        <CapabilityBadges
                          embeddingCount={providerData.embeddingCount}
                          chatCount={providerData.chatCount}
                          visionCount={providerData.visionCount}
                          functionCount={providerData.functionCount}
                          provider={providerData.provider}
                          onFilterByCapability={filterByCapability}
                        />
                      </div>
                    </div>
                  </div>
                )
              })}

            {/* Usage Statistics Card */}
            <div className="card border-base-300 bg-base-100 border shadow-lg">
              <div className="card-body p-6">
                <div className="flex flex-col">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="text-sm opacity-60">Usage</p>
                    <select
                      className="select select-xs"
                      value={usagePeriod}
                      onChange={(e) => setUsagePeriod(e.target.value as 'week' | 'month' | 'year')}
                    >
                      <option value="week">Last Week</option>
                      <option value="month">Last Month</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs opacity-60">Requests</span>
                      <span className="text-sm font-bold">{(usageStats?.totalRequests ?? 0).toLocaleString()}</span>
                    </div>
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs opacity-60">Tokens</span>
                      <span className="text-sm font-bold">
                        {usageStats
                          ? ((usageStats.totalTokensInput + usageStats.totalTokensOutput) / 1000).toFixed(1)
                          : '0'}
                        k
                      </span>
                    </div>
                  </div>
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
                              className="badge badge-outline badge-sm badge-info hover:badge-info-content"
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
                              className="badge badge-outline badge-sm badge-primary hover:badge-primary-content"
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
                              className="badge badge-outline badge-sm badge-accent hover:badge-accent-content"
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
