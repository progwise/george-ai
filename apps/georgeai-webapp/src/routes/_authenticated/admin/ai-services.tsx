import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useRef, useState } from 'react'

import { getAiServiceStatusQueryOptions } from '../../../components/admin/ai-services/get-ai-service-status'
import { getAiProvidersQueryOptions } from '../../../components/admin/queries/get-ai-providers'
import { createProviderFn } from '../../../components/admin/server-functions/create-provider'
import { deleteProviderFn } from '../../../components/admin/server-functions/delete-provider'
import { restoreDefaultProvidersFn } from '../../../components/admin/server-functions/restore-default-providers'
import { testProviderConnectionFn } from '../../../components/admin/server-functions/test-provider-connection'
import { toggleProviderFn } from '../../../components/admin/server-functions/toggle-provider'
import { updateProviderFn } from '../../../components/admin/server-functions/update-provider'
import { ClientDate } from '../../../components/client-date'
import { DialogForm } from '../../../components/dialog-form'
import { toastError, toastSuccess } from '../../../components/georgeToaster'
import { AiServiceProviderInput } from '../../../gql/graphql'
import BotIcon from '../../../icons/bot-icon'
import { EditIcon } from '../../../icons/edit-icon'
import { OllamaLogoIcon } from '../../../icons/ollama-logo-icon'
import { OpenAILogoIcon } from '../../../icons/openai-logo-icon'
import { ServerIcon } from '../../../icons/server-icon'
import { TrashIcon } from '../../../icons/trash-icon'

export const Route = createFileRoute('/_authenticated/admin/ai-services')({
  component: AiServicesAdminPage,
  loader: async ({ context }) => {
    await Promise.all([
      context.queryClient.ensureQueryData(getAiServiceStatusQueryOptions()),
      context.queryClient.ensureQueryData(getAiProvidersQueryOptions()),
    ])
  },
})

type ProviderFormData = {
  id?: string
  provider: string
  name: string
  enabled: boolean
  baseUrl?: string
  apiKeyHint?: string | null
  vramGb?: number
}

const getProviderIcon = (provider: string, className?: string) => {
  switch (provider.toLowerCase()) {
    case 'ollama':
      return <OllamaLogoIcon className={className} />
    case 'openai':
      return <OpenAILogoIcon className={className} />
    case 'anthropic':
      return <BotIcon className={className} />
    default:
      return <BotIcon className={className} />
  }
}

const getProviderHealthBadge = (isOnline: boolean | null) => {
  if (isOnline === null) {
    return <div className="badge badge-ghost badge-xs">Unknown</div>
  }
  return isOnline ? (
    <div className="badge badge-xs badge-success">Healthy</div>
  ) : (
    <div className="badge badge-xs badge-error">Offline</div>
  )
}

function AiServicesAdminPage() {
  const { queryClient } = Route.useRouteContext()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [editingProvider, setEditingProvider] = useState<ProviderFormData | null>(null)
  const [deletingProviderId, setDeletingProviderId] = useState<string | null>(null)
  const [selectedProviderType, setSelectedProviderType] = useState<string>('ollama')

  const providerDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  const { data: serviceStatus } = useSuspenseQuery({
    ...getAiServiceStatusQueryOptions(),
    refetchInterval: autoRefresh ? 5000 : false,
  })

  const { data: providers } = useSuspenseQuery(getAiProvidersQueryOptions())

  const createMutation = useMutation({
    mutationFn: (data: AiServiceProviderInput) => createProviderFn({ data }),
    onSuccess: () => {
      toastSuccess('Provider created successfully')
      queryClient.invalidateQueries(getAiProvidersQueryOptions())
      providerDialogRef.current?.close()
      setEditingProvider(null)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to create provider')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: AiServiceProviderInput }) =>
      updateProviderFn({ data: { id, data } }),
    onSuccess: () => {
      toastSuccess('Provider updated successfully')
      queryClient.invalidateQueries(getAiProvidersQueryOptions())
      providerDialogRef.current?.close()
      setEditingProvider(null)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to update provider')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProviderFn({ data: id }),
    onSuccess: () => {
      toastSuccess('Provider deleted successfully')
      queryClient.invalidateQueries(getAiProvidersQueryOptions())
      deleteDialogRef.current?.close()
      setDeletingProviderId(null)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to delete provider')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: string; enabled: boolean }) => toggleProviderFn({ data: { id, enabled } }),
    onSuccess: () => queryClient.invalidateQueries(getAiProvidersQueryOptions()),
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to toggle provider')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: restoreDefaultProvidersFn,
    onSuccess: (result) => {
      toastSuccess(`Restored ${result.created} providers (${result.skipped} already existed)`)
      queryClient.invalidateQueries(getAiProvidersQueryOptions())
      queryClient.invalidateQueries(getAiServiceStatusQueryOptions())
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to restore default providers')
    },
  })

  const testConnectionMutation = useMutation({
    mutationFn: (data: { providerId?: string; provider: string; baseUrl?: string; apiKey?: string }) =>
      testProviderConnectionFn({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(
          <div>
            <div>{result.message}</div>
            {result.details && <div className="text-xs opacity-70">{result.details}</div>}
          </div>,
        )
      } else {
        toastError(
          <div>
            <div>{result.message}</div>
            {result.details && <div className="text-xs opacity-70">{result.details}</div>}
          </div>,
        )
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Connection test failed')
    },
  })

  const handleAddProvider = () => {
    setEditingProvider({
      provider: 'ollama',
      name: '',
      enabled: true,
    })
    setSelectedProviderType('ollama')
    providerDialogRef.current?.showModal()
  }

  const handleEditProvider = (provider: (typeof providers)[0]) => {
    setEditingProvider({
      id: provider.id,
      provider: provider.provider,
      name: provider.name,
      enabled: provider.enabled,
      baseUrl: provider.baseUrl ?? undefined,
      apiKeyHint: provider.apiKeyHint,
      vramGb: provider.vramGb ?? undefined,
    })
    setSelectedProviderType(provider.provider)
    providerDialogRef.current?.showModal()
  }

  const handleDeleteProvider = (id: string) => {
    setDeletingProviderId(id)
    deleteDialogRef.current?.showModal()
  }

  const handleSubmitProvider = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const formBaseUrl = (formData.get('baseUrl') as string)?.trim()
    const formApiKey = (formData.get('apiKey') as string)?.trim()

    const data: AiServiceProviderInput = {
      provider: selectedProviderType,
      name: formData.get('name') as string,
      enabled: formData.get('enabled') === 'on',
      baseUrl: formBaseUrl || undefined,
      // Send undefined if empty - backend will preserve existing value when updating
      apiKey: formApiKey || undefined,
      vramGb: formData.get('vramGb') ? Number(formData.get('vramGb')) : undefined,
    }

    if (editingProvider?.id) {
      updateMutation.mutate({ id: editingProvider.id, data })
    } else {
      createMutation.mutate(data)
    }
  }

  const handleConfirmDelete = () => {
    if (deletingProviderId) {
      deleteMutation.mutate(deletingProviderId)
    }
  }

  const formatMemory = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  const getMemoryUtilization = (used: number, total: number) => {
    if (total === 0) return 0
    return Math.round((used / total) * 100)
  }

  const getStatusBadge = (isOnline: boolean) => {
    return isOnline ? 'badge-success' : 'badge-error'
  }

  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return 'progress-success'
    if (percentage < 80) return 'progress-warning'
    return 'progress-error'
  }

  return (
    <div className="container mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-linear-to-br from-secondary/20 to-secondary/10 p-3 shadow-lg">
            <ServerIcon className="size-8 text-secondary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-primary">AI Service Providers</h1>
            <p className="text-lg opacity-70">Auto-refreshing every 5 seconds</p>
          </div>
        </div>
        <div className="flex gap-2">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="ml-2">Auto Refresh</span>
          </label>
          <button
            className="btn btn-secondary"
            onClick={() => restoreMutation.mutate({})}
            disabled={restoreMutation.isPending}
            type="button"
          >
            {restoreMutation.isPending ? 'Restoring...' : 'Restore Default Providers'}
          </button>
          <button className="btn btn-primary" onClick={handleAddProvider} type="button">
            Add Provider
          </button>
        </div>
      </div>

      {/* Configured Providers */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Configured Providers</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {providers.length === 0 ? (
            <div className="rounded-lg border border-info bg-info/10 p-4 text-sm">
              <span>No providers configured. Add your first provider to get started.</span>
            </div>
          ) : (
            providers.map((provider) => {
              // Find matching instance from service status
              const instance = serviceStatus.instances.find((inst) => inst.url === provider.baseUrl)
              const isOnline = instance ? instance.isOnline : null

              return (
                <div key={provider.id} className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
                  <div className="flex h-full flex-col items-start justify-between gap-2">
                    <h3 className="flex w-full items-start justify-between gap-2 text-base font-bold">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(provider.provider, 'h-6 w-6')}
                        {provider.name}
                      </div>
                      <div className="flex flex-wrap justify-end gap-1">
                        <div className={`badge badge-xs ${provider.enabled ? 'badge-success' : 'badge-error'}`}>
                          {provider.enabled ? 'Enabled' : 'Disabled'}
                        </div>
                        {getProviderHealthBadge(isOnline)}
                      </div>
                    </h3>
                    <div className="flex-1">
                      {provider.baseUrl && <p className="text-sm opacity-70">{provider.baseUrl}</p>}
                      {typeof provider.vramGb === 'number' && !isNaN(provider.vramGb) && (
                        <p className="text-sm opacity-70">VRAM: {provider.vramGb} GB</p>
                      )}
                      {provider.apiKeyHint && (
                        <p className="text-sm opacity-50">API Key: **** **** **** {provider.apiKeyHint}</p>
                      )}
                    </div>

                    <div className="flex w-full justify-between gap-2">
                      <div className="flex cursor-pointer items-center gap-2">
                        <input
                          type="checkbox"
                          className="toggle toggle-sm toggle-success"
                          checked={provider.enabled}
                          onChange={(e) => toggleMutation.mutate({ id: provider.id, enabled: e.target.checked })}
                        />
                        <span className="text-sm">{provider.enabled ? 'Disable' : 'Enable'}</span>
                      </div>
                      <div>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleEditProvider(provider)}
                          type="button"
                        >
                          <EditIcon className="mr-1 size-4" />
                          Edit
                        </button>
                        <button
                          className="btn btn-ghost btn-sm btn-error"
                          onClick={() => handleDeleteProvider(provider.id)}
                          type="button"
                        >
                          <TrashIcon className="mr-1 size-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

      {/* Overview Metrics */}
      <div>
        <h2 className="mb-4 text-xl font-semibold">Overview Metrics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">
              Total Providers
            </div>
            <div className="text-3xl font-bold text-primary">{providers.length}</div>
            <div className="mt-1 text-sm text-base-content/70">{providers.filter((p) => p.enabled).length} enabled</div>
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">
              Ollama Instances
            </div>
            <div className="text-3xl font-bold text-secondary">{serviceStatus.totalInstances}</div>
            <div className="mt-1 text-sm text-base-content/70">{serviceStatus.healthyInstances} healthy</div>
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">Total VRAM</div>
            <div className="text-3xl font-bold text-accent">{formatMemory(serviceStatus.totalMemory)}</div>
            <div className="mt-1 text-sm text-base-content/70">
              {formatMemory(serviceStatus.totalUsedMemory)} used (
              {getMemoryUtilization(serviceStatus.totalUsedMemory, serviceStatus.totalMemory)}%)
            </div>
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">Queue Length</div>
            <div className="text-3xl font-bold text-info">{serviceStatus.totalQueueLength}</div>
            <div className="mt-1 text-sm text-base-content/70">Total waiting requests</div>
          </div>
        </div>
      </div>

      {/* Ollama Instance Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ollama Instance Details</h2>

        {serviceStatus.instances.length === 0 ? (
          <div className="rounded-lg border border-warning bg-warning/10 p-4 text-sm">
            <span>No Ollama instances found. Please check your configuration.</span>
          </div>
        ) : (
          serviceStatus.instances
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((instance) => {
              const memoryUtilization = getMemoryUtilization(instance.usedVram, instance.totalVram)

              return (
                <div key={instance.name} className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <h3 className="flex items-center gap-2 text-lg font-bold">
                        <OllamaLogoIcon className="size-6" />
                        {instance.name}
                        <div className={`badge ${getStatusBadge(instance.isOnline)}`}>
                          {instance.isOnline ? 'Online' : 'Offline'}
                        </div>
                        <div className="badge badge-outline">{instance.type}</div>
                      </h3>
                      <p className="text-sm opacity-70">{instance.url}</p>
                      {instance.version && <p className="text-xs opacity-50">Version: {instance.version}</p>}
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg bg-base-200 p-4 lg:flex-row">
                      <div className="text-center">
                        <div className="text-xs font-medium text-base-content/60">VRAM Usage</div>
                        <div className="text-sm font-bold">{formatMemory(instance.usedVram)}</div>
                        <div className="text-xs text-base-content/70">of {formatMemory(instance.totalVram)}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-xs font-medium text-base-content/60">Utilization</div>
                        <div className="text-sm font-bold">{memoryUtilization}%</div>
                        <div className="text-xs text-base-content/70">
                          <progress
                            className={`progress w-16 ${getUtilizationColor(memoryUtilization)}`}
                            value={memoryUtilization}
                            max="100"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div>
                      <details className="rounded-lg bg-base-200">
                        <summary className="cursor-pointer p-4 text-sm font-semibold">
                          <div className="flex items-center gap-2">
                            <div className="badge badge-sm badge-info">{instance.availableModels?.length || 0}</div>
                            Available Models
                          </div>
                        </summary>
                        <div className="px-4 pb-4">
                          <div className="max-h-48 space-y-1 overflow-y-auto">
                            {instance.availableModels && instance.availableModels.length > 0 ? (
                              instance.availableModels.map((model) => (
                                <div key={model.name} className="rounded-sm border border-base-300 bg-base-100 p-2">
                                  <div className="font-mono text-xs font-medium">{model.name}</div>
                                  <div className="text-xs opacity-70">
                                    {model.family && (
                                      <span className="mr-1 badge badge-ghost badge-xs">{model.family}</span>
                                    )}
                                    {model.size !== undefined && <span>Size: {formatMemory(model.size)}</span>}
                                    {model.parameterSize && <span> • {model.parameterSize} params</span>}
                                  </div>
                                  {model.capabilities && model.capabilities.length > 0 && (
                                    <div className="mt-1 flex flex-wrap gap-1">
                                      {model.capabilities.map((cap) => (
                                        <div key={cap} className="badge badge-outline badge-xs">
                                          {cap}
                                        </div>
                                      ))}
                                    </div>
                                  )}
                                </div>
                              ))
                            ) : (
                              <p className="py-2 text-center text-xs opacity-50">No models available</p>
                            )}
                          </div>
                        </div>
                      </details>
                    </div>

                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <div className="badge badge-sm badge-success">{instance.runningModels?.length || 0}</div>
                        Running Models
                      </h4>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {instance.runningModels && instance.runningModels.length > 0 ? (
                          instance.runningModels.map((model) => (
                            <div key={model.name} className="rounded-sm border border-base-300 bg-base-200 p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-sm font-medium">{model.name}</span>
                                <div className="badge badge-sm badge-info">{model.activeRequests} active</div>
                              </div>
                              <div className="flex justify-between text-xs opacity-70">
                                <span>Size: {formatMemory(model.size)}</span>
                                {model.expiresAt && (
                                  <span>
                                    Expires: <ClientDate date={model.expiresAt} format="time" />
                                  </span>
                                )}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="py-4 text-center text-sm opacity-50">No models currently running</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="mb-3 flex items-center gap-2 font-semibold">
                        <div className="badge badge-sm badge-warning">{instance.modelQueues?.length || 0}</div>
                        Model Queues
                      </h4>
                      <div className="max-h-48 space-y-2 overflow-y-auto">
                        {instance.modelQueues && instance.modelQueues.length > 0 ? (
                          instance.modelQueues.map((queue) => (
                            <div key={queue.modelName} className="rounded-sm border border-base-300 bg-base-200 p-3">
                              <div className="flex items-center justify-between">
                                <span className="font-mono text-sm font-medium">{queue.modelName}</span>
                                <div className="badge badge-outline badge-sm">
                                  {queue.queueLength}/{queue.maxConcurrency}
                                </div>
                              </div>
                              <div className="text-xs opacity-70">
                                Est. size per request: {formatMemory(queue.estimatedRequestSize)}
                              </div>
                              {queue.queueLength > 0 && (
                                <progress
                                  className="progress w-full progress-warning"
                                  value={queue.queueLength}
                                  max={queue.maxConcurrency}
                                />
                              )}
                            </div>
                          ))
                        ) : (
                          <p className="py-4 text-center text-sm opacity-50">No active queues</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })
        )}
      </div>

      <dialog className="modal" ref={providerDialogRef}>
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="mb-6 text-2xl font-bold">{editingProvider?.id ? 'Edit Provider' : 'Add Provider'}</h3>
          <form key={editingProvider?.id || 'new'} onSubmit={handleSubmitProvider} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold">Provider Type</label>
              <select
                name="provider"
                className="select w-full"
                defaultValue={editingProvider?.provider}
                onChange={(e) => setSelectedProviderType(e.target.value)}
                disabled={!!editingProvider?.id}
                required
              >
                <option value="ollama">Ollama - Self-hosted LLM runtime</option>
                <option value="openai">OpenAI - GPT models</option>
              </select>
              <p className="mt-1 text-xs text-base-content/60">
                {editingProvider?.id
                  ? 'Provider type cannot be changed. Only one non-Ollama provider of each type can be enabled.'
                  : 'Choose the AI service provider type. Only one non-Ollama provider of each type can be enabled.'}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-semibold">Display Name</label>
                <input
                  type="text"
                  name="name"
                  className="input w-full"
                  defaultValue={editingProvider?.name}
                  placeholder="e.g., Primary Ollama"
                  required
                />
                <p className="mt-1 text-xs text-base-content/60">A friendly name to identify this provider</p>
              </div>

              {selectedProviderType === 'ollama' && (
                <div>
                  <label className="mb-2 block text-sm font-semibold">VRAM (GB)</label>
                  <input
                    type="number"
                    name="vramGb"
                    className="input w-full"
                    defaultValue={editingProvider?.vramGb}
                    placeholder="e.g., 32"
                    min="1"
                  />
                  <p className="mt-1 text-xs text-base-content/60">GPU memory available for this instance</p>
                </div>
              )}
            </div>

            {selectedProviderType === 'ollama' && (
              <div>
                <label className="mb-2 block text-sm font-semibold">Base URL</label>
                <input
                  type="url"
                  name="baseUrl"
                  className="input w-full font-mono text-sm"
                  defaultValue={editingProvider?.baseUrl}
                  placeholder="e.g., http://ollama:11434"
                />
                <p className="mt-1 text-xs text-base-content/60">The Ollama API endpoint URL</p>
              </div>
            )}

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold">API Key</label>
                {editingProvider?.apiKeyHint && (
                  <span className="text-xs text-base-content/60">
                    Current: <span className="font-mono">{editingProvider.apiKeyHint}</span>
                  </span>
                )}
              </div>
              <input
                type="password"
                name="apiKey"
                className="input w-full font-mono text-sm"
                placeholder={
                  editingProvider?.apiKeyHint
                    ? 'Leave empty to keep existing key'
                    : selectedProviderType === 'openai'
                      ? 'sk-...'
                      : 'Optional'
                }
                autoComplete="new-password"
                required={selectedProviderType === 'openai' && !editingProvider?.apiKeyHint}
              />
              <p className="mt-1 text-xs text-base-content/60">
                {selectedProviderType === 'openai'
                  ? editingProvider?.apiKeyHint
                    ? 'Enter a new key to replace the existing one'
                    : 'Required - Your OpenAI API key'
                  : 'Optional - Only needed if Ollama requires authentication'}
              </p>
            </div>

            <div>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={(e) => {
                  const form = e.currentTarget.form
                  if (!form) return

                  const formData = new FormData(form)
                  const formBaseUrl = (formData.get('baseUrl') as string)?.trim()
                  const formApiKey = (formData.get('apiKey') as string)?.trim()

                  testConnectionMutation.mutate({
                    providerId: editingProvider?.id,
                    provider: selectedProviderType,
                    baseUrl: formBaseUrl || undefined,
                    apiKey: formApiKey || undefined,
                  })
                }}
                disabled={testConnectionMutation.isPending}
              >
                {testConnectionMutation.isPending ? (
                  <>
                    <span className="loading loading-xs loading-spinner" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
              <p className="mt-1 text-xs text-base-content/60">
                Verify that the provider is reachable with the configured credentials
              </p>
            </div>

            <div className="divider" />

            <div>
              <label className="flex cursor-pointer items-start gap-4">
                <input
                  type="checkbox"
                  name="enabled"
                  className="checkbox checkbox-primary"
                  defaultChecked={editingProvider?.enabled}
                />
                <div>
                  <span className="text-sm font-semibold">Enable this provider</span>
                  <p className="text-xs opacity-70">Disabled providers won't be used for AI operations</p>
                </div>
              </label>
            </div>

            <div className="modal-action">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => {
                  providerDialogRef.current?.close()
                  setEditingProvider(null)
                }}
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                {createMutation.isPending || updateMutation.isPending ? (
                  <>
                    <span className="loading loading-spinner" />
                    {editingProvider?.id ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{editingProvider?.id ? 'Update Provider' : 'Create Provider'}</>
                )}
              </button>
            </div>
          </form>
        </div>
        <form method="dialog" className="modal-backdrop">
          <button type="button">close</button>
        </form>
      </dialog>

      <DialogForm
        ref={deleteDialogRef}
        title="Delete Provider?"
        description="This action cannot be undone. Are you sure you want to delete this provider?"
        onSubmit={handleConfirmDelete}
        submitButtonText="Delete"
        disabledSubmit={deleteMutation.isPending}
      />
    </div>
  )
}
