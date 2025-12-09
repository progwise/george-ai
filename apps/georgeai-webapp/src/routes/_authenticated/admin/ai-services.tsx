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
import { OllamaLogoIcon } from '../../../icons/ollama-logo-icon'
import { OpenAILogoIcon } from '../../../icons/openai-logo-icon'

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
      console.log('Error creating provider:', error)
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
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Service Providers</h1>
          <p className="text-sm opacity-70">Auto-refreshing every 5 seconds</p>
        </div>
        <div className="flex gap-2">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="label-text ml-2">Auto Refresh</span>
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

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Configured Providers</h2>
        <div className="space-y-4">
          {providers.length === 0 ? (
            <div className="alert alert-info">
              <span>No providers configured. Add your first provider to get started.</span>
            </div>
          ) : (
            providers.map((provider) => (
              <div key={provider.id} className="card bg-base-100 shadow-md">
                <div className="card-body">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="card-title">
                        {getProviderIcon(provider.provider, 'h-6 w-6')}
                        {provider.name}
                        <div className={`badge ${provider.enabled ? 'badge-success' : 'badge-error'}`}>
                          {provider.enabled ? 'Enabled' : 'Disabled'}
                        </div>
                        <div className="badge badge-outline">{provider.provider}</div>
                      </h3>
                      {provider.baseUrl && <p className="text-sm opacity-70">{provider.baseUrl}</p>}
                      {provider.vramGb !== null && <p className="text-sm opacity-70">VRAM: {provider.vramGb} GB</p>}
                    </div>

                    <div className="flex gap-2">
                      <label className="label cursor-pointer">
                        <input
                          type="checkbox"
                          className="toggle toggle-success"
                          checked={provider.enabled}
                          onChange={(e) => toggleMutation.mutate({ id: provider.id, enabled: e.target.checked })}
                        />
                      </label>
                      <button
                        className="btn btn-sm btn-ghost"
                        onClick={() => handleEditProvider(provider)}
                        type="button"
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error btn-ghost"
                        onClick={() => handleDeleteProvider(provider.id)}
                        type="button"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-2xl font-semibold">Overview Metrics</h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Total Providers</div>
            <div className="stat-value text-primary">{providers.length}</div>
            <div className="stat-desc">{providers.filter((p) => p.enabled).length} enabled</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Ollama Instances</div>
            <div className="stat-value text-secondary">{serviceStatus.availableInstances}</div>
            <div className="stat-desc">{serviceStatus.healthyInstances} healthy</div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Total VRAM</div>
            <div className="stat-value text-accent">{formatMemory(serviceStatus.totalMemory)}</div>
            <div className="stat-desc">
              {formatMemory(serviceStatus.totalUsedMemory)} used (
              {getMemoryUtilization(serviceStatus.totalUsedMemory, serviceStatus.totalMemory)}%)
            </div>
          </div>

          <div className="stat bg-base-200 rounded-lg">
            <div className="stat-title">Queue Length</div>
            <div className="stat-value text-info">{serviceStatus.totalQueueLength}</div>
            <div className="stat-desc">Total waiting requests</div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Ollama Instance Details</h2>

        {serviceStatus.instances.length === 0 ? (
          <div className="alert alert-warning">
            <span>No Ollama instances found. Please check your configuration.</span>
          </div>
        ) : (
          serviceStatus.instances
            .sort((a, b) => a.name.localeCompare(b.name))
            .map((instance) => {
              const memoryUtilization = getMemoryUtilization(instance.usedVram, instance.totalVram)

              return (
                <div key={instance.name} className="card bg-base-100 shadow-xl">
                  <div className="card-body">
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="card-title">
                          <OllamaLogoIcon className="h-6 w-6" />
                          {instance.name}
                          <div className={`badge ${getStatusBadge(instance.isOnline)}`}>
                            {instance.isOnline ? 'Online' : 'Offline'}
                          </div>
                          <div className="badge badge-outline">{instance.type}</div>
                        </h3>
                        <p className="text-sm opacity-70">{instance.url}</p>
                        {instance.version && <p className="text-xs opacity-50">Version: {instance.version}</p>}
                      </div>

                      <div className="stats stats-vertical lg:stats-horizontal bg-base-200">
                        <div className="stat">
                          <div className="stat-title text-xs">VRAM Usage</div>
                          <div className="stat-value text-sm">{formatMemory(instance.usedVram)}</div>
                          <div className="stat-desc text-xs">of {formatMemory(instance.totalVram)}</div>
                        </div>
                        <div className="stat">
                          <div className="stat-title text-xs">Utilization</div>
                          <div className="stat-value text-sm">{memoryUtilization}%</div>
                          <div className="stat-desc text-xs">
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
                        <div className="bg-base-200 collapse">
                          <input type="checkbox" />
                          <div className="collapse-title text-sm font-semibold">
                            <div className="flex items-center gap-2">
                              <div className="badge badge-info badge-sm">{instance.availableModels?.length || 0}</div>
                              Available Models
                            </div>
                          </div>
                          <div className="collapse-content">
                            <div className="max-h-48 space-y-1 overflow-y-auto pt-2">
                              {instance.availableModels && instance.availableModels.length > 0 ? (
                                instance.availableModels.map((model) => (
                                  <div key={model.name} className="card card-compact bg-base-100">
                                    <div className="card-body">
                                      <div className="font-mono text-xs font-medium">{model.name}</div>
                                      <div className="text-xs opacity-70">
                                        {model.family && (
                                          <span className="badge badge-ghost badge-xs mr-1">{model.family}</span>
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
                                  </div>
                                ))
                              ) : (
                                <p className="py-2 text-center text-xs opacity-50">No models available</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-semibold">
                          <div className="badge badge-success badge-sm">{instance.runningModels?.length || 0}</div>
                          Running Models
                        </h4>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {instance.runningModels && instance.runningModels.length > 0 ? (
                            instance.runningModels.map((model) => (
                              <div key={model.name} className="card card-compact bg-base-200">
                                <div className="card-body">
                                  <div className="flex items-center justify-between">
                                    <span className="font-mono text-sm font-medium">{model.name}</span>
                                    <div className="badge badge-info badge-sm">{model.activeRequests} active</div>
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
                              </div>
                            ))
                          ) : (
                            <p className="py-4 text-center text-sm opacity-50">No models currently running</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-3 flex items-center gap-2 font-semibold">
                          <div className="badge badge-warning badge-sm">{instance.modelQueues?.length || 0}</div>
                          Model Queues
                        </h4>
                        <div className="max-h-48 space-y-2 overflow-y-auto">
                          {instance.modelQueues && instance.modelQueues.length > 0 ? (
                            instance.modelQueues.map((queue) => (
                              <div key={queue.modelName} className="card card-compact bg-base-200">
                                <div className="card-body">
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
                                      className="progress progress-warning w-full"
                                      value={queue.queueLength}
                                      max={queue.maxConcurrency}
                                    />
                                  )}
                                </div>
                              </div>
                            ))
                          ) : (
                            <p className="py-4 text-center text-sm opacity-50">No active queues</p>
                          )}
                        </div>
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
            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">Provider Type</span>
              </label>
              <select
                name="provider"
                className="select select-bordered w-full"
                defaultValue={editingProvider?.provider}
                onChange={(e) => setSelectedProviderType(e.target.value)}
                disabled={!!editingProvider?.id}
                required
              >
                <option value="ollama">Ollama - Self-hosted LLM runtime</option>
                <option value="openai">OpenAI - GPT models</option>
              </select>
              <label className="label">
                <span className="label-text-alt">
                  {editingProvider?.id
                    ? 'Provider type cannot be changed. Only one non-Ollama provider of each type can be enabled.'
                    : 'Choose the AI service provider type. Only one non-Ollama provider of each type can be enabled.'}
                </span>
              </label>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Display Name</span>
                </label>
                <input
                  type="text"
                  name="name"
                  className="input input-bordered w-full"
                  defaultValue={editingProvider?.name}
                  placeholder="e.g., Primary Ollama"
                  required
                />
                <label className="label">
                  <span className="label-text-alt">A friendly name to identify this provider</span>
                </label>
              </div>

              {selectedProviderType === 'ollama' && (
                <div className="form-control">
                  <label className="label">
                    <span className="label-text font-semibold">VRAM (GB)</span>
                  </label>
                  <input
                    type="number"
                    name="vramGb"
                    className="input input-bordered w-full"
                    defaultValue={editingProvider?.vramGb}
                    placeholder="e.g., 32"
                    min="1"
                  />
                  <label className="label">
                    <span className="label-text-alt">GPU memory available for this instance</span>
                  </label>
                </div>
              )}
            </div>

            {selectedProviderType === 'ollama' && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">Base URL</span>
                </label>
                <input
                  type="url"
                  name="baseUrl"
                  className="input input-bordered w-full font-mono text-sm"
                  defaultValue={editingProvider?.baseUrl}
                  placeholder="e.g., http://ollama:11434"
                />
                <label className="label">
                  <span className="label-text-alt">The Ollama API endpoint URL</span>
                </label>
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-semibold">API Key</span>
                {editingProvider?.apiKeyHint && (
                  <span className="label-text-alt">
                    Current: <span className="font-mono">{editingProvider.apiKeyHint}</span>
                  </span>
                )}
              </label>
              <input
                type="password"
                name="apiKey"
                className="input input-bordered w-full font-mono text-sm"
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
              <label className="label">
                <span className="label-text-alt">
                  {selectedProviderType === 'openai'
                    ? editingProvider?.apiKeyHint
                      ? 'Enter a new key to replace the existing one'
                      : 'Required - Your OpenAI API key'
                    : 'Optional - Only needed if Ollama requires authentication'}
                </span>
              </label>
            </div>

            <div className="form-control">
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
                    <span className="loading loading-spinner loading-xs" />
                    Testing Connection...
                  </>
                ) : (
                  'Test Connection'
                )}
              </button>
              <label className="label">
                <span className="label-text-alt">
                  Verify that the provider is reachable with the configured credentials
                </span>
              </label>
            </div>

            <div className="divider" />

            <div className="form-control">
              <label className="label cursor-pointer justify-start gap-4">
                <input
                  type="checkbox"
                  name="enabled"
                  className="checkbox checkbox-primary"
                  defaultChecked={editingProvider?.enabled}
                />
                <div>
                  <span className="label-text font-semibold">Enable this provider</span>
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
