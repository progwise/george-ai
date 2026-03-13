import { useMutation, useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useMemo, useRef, useState } from 'react'

import {
  createInferenceHostFn,
  deleteInferenceHostFn,
  disableInferenceHostFn,
  enableInferenceHostFn,
  restoreDefaultProvidersFn,
  testInferenceHostConnectionFn,
  updateInferenceHostFn,
} from '../../../components/admin/server-functions'
import { DialogForm } from '../../../components/dialog-form'
import { toastError, toastSuccess } from '../../../components/georgeToaster'
import {
  getInferenceHostConfigQueryOptions,
  getInferenceHostStatusQueryOptions,
} from '../../../components/workspace/queries'
import { InferenceDriver, InferenceHostInput } from '../../../gql/graphql'
import { InferenceDriverSchema } from '../../../gql/validation'
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
      context.queryClient.ensureQueryData(getInferenceHostStatusQueryOptions()),
      context.queryClient.ensureQueryData(getInferenceHostConfigQueryOptions()),
    ])
  },
})

type ProviderFormData = {
  hostId?: string
  driver: string
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
  const { queryClient, user } = Route.useRouteContext()
  const [autoRefresh, setAutoRefresh] = useState(true)
  const [editingProvider, setEditingProvider] = useState<ProviderFormData | null>(null)
  const [deletingProviderId, setDeletingProviderId] = useState<string | null>(null)
  const [selectedProviderType, setSelectedProviderType] = useState<string>('ollama')

  const providerDialogRef = useRef<HTMLDialogElement>(null)
  const deleteDialogRef = useRef<HTMLDialogElement>(null)

  const { data: serviceStatus } = useSuspenseQuery({
    ...getInferenceHostStatusQueryOptions(),
    refetchInterval: autoRefresh ? 5000 : false,
  })

  const { data: providers } = useSuspenseQuery(getInferenceHostConfigQueryOptions())

  const statusWithProvider = useMemo(
    () =>
      serviceStatus.map((status) => {
        const provider = providers.find((provider) => provider.hostId === status.hostId)
        return {
          ...status,
          name: provider?.name,
          isOnline: status.state === 'healthy',
          provider,
        }
      }),
    [providers, serviceStatus],
  )

  const createMutation = useMutation({
    mutationFn: (data: { driver: InferenceDriver; input: InferenceHostInput }) => createInferenceHostFn({ data }),
    onSuccess: () => {
      toastSuccess('Provider created successfully')
      queryClient.invalidateQueries(getInferenceHostConfigQueryOptions())
      queryClient.invalidateQueries(getInferenceHostStatusQueryOptions())
      providerDialogRef.current?.close()
      setEditingProvider(null)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to create provider')
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { hostId: string; input: InferenceHostInput }) => updateInferenceHostFn({ data }),
    onSuccess: () => {
      toastSuccess('Provider updated successfully')
      queryClient.invalidateQueries(getInferenceHostConfigQueryOptions())
      queryClient.invalidateQueries(getInferenceHostStatusQueryOptions())
      providerDialogRef.current?.close()
      setEditingProvider(null)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to update provider')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (data: { hostId: string }) => deleteInferenceHostFn({ data }),
    onSuccess: () => {
      toastSuccess('Provider deleted successfully')
      queryClient.invalidateQueries(getInferenceHostConfigQueryOptions())
      queryClient.invalidateQueries(getInferenceHostStatusQueryOptions())
      deleteDialogRef.current?.close()
      setDeletingProviderId(null)
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to delete provider')
    },
  })

  const toggleMutation = useMutation({
    mutationFn: (data: { hostId: string; enabled: boolean }) =>
      data.enabled ? enableInferenceHostFn({ data }) : disableInferenceHostFn({ data }),
    onSuccess: () => {
      queryClient.invalidateQueries(getInferenceHostConfigQueryOptions())
      queryClient.invalidateQueries(getInferenceHostStatusQueryOptions())
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to toggle provider')
    },
  })

  const restoreMutation = useMutation({
    mutationFn: restoreDefaultProvidersFn,
    onSuccess: (result) => {
      toastSuccess(`Restored ${result.created} providers (${result.skipped} already existed)`)
      queryClient.invalidateQueries(getInferenceHostConfigQueryOptions())
      queryClient.invalidateQueries(getInferenceHostStatusQueryOptions())
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Failed to restore default providers')
    },
  })

  const testConnectionMutation = useMutation({
    mutationFn: (data: {
      workspaceId: string
      hostId?: string
      driver: InferenceDriver
      baseUrl?: string
      apiKey?: string
    }) => testInferenceHostConnectionFn({ data }),
    onSuccess: (result) => {
      if (result.success) {
        toastSuccess(
          <div>
            <div>{result.message}</div>
          </div>,
        )
      } else {
        toastError(
          <div>
            <div>{result.message}</div>
          </div>,
        )
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : String(error)
      toastError(message || 'Connection test failed')
    },
    onSettled: () => {
      queryClient.invalidateQueries(getInferenceHostConfigQueryOptions())
      queryClient.invalidateQueries(getInferenceHostStatusQueryOptions())
    },
  })

  const handleAddProvider = () => {
    setEditingProvider({
      driver: 'ollama',
      name: '',
      enabled: true,
    })
    setSelectedProviderType('ollama')
    providerDialogRef.current?.showModal()
  }

  const handleEditProvider = (provider: (typeof providers)[0]) => {
    setEditingProvider({
      hostId: provider.hostId,
      driver: provider.driver,
      name: provider.name ?? 'Host not named', // TODO
      enabled: provider.enabled,
      baseUrl: provider.url ?? undefined,
      apiKeyHint: provider.apiKeyHint,
      vramGb: provider.configuredVramGb ?? undefined,
    })
    setSelectedProviderType(provider.driver)
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

    const input: InferenceHostInput = {
      name: formData.get('name') as string,
      baseUrl: formBaseUrl || undefined,
      // Send undefined if empty - backend will preserve existing value when updating
      apiKey: formApiKey || undefined,
      vramGb: formData.get('vramGb') ? Number(formData.get('vramGb')) : undefined,
    }

    if (editingProvider?.hostId) {
      updateMutation.mutate({ hostId: editingProvider.hostId, input })
    } else {
      createMutation.mutate({
        driver: InferenceDriverSchema.parse(selectedProviderType),
        input,
      })
    }
  }

  const handleConfirmDelete = () => {
    if (deletingProviderId) {
      deleteMutation.mutate({ hostId: deletingProviderId })
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
              const instance = serviceStatus.find((inst) => inst.url === provider.url)
              const isOnline = instance ? instance.state === 'healthy' : null

              return (
                <div key={provider.hostId} className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
                  <div className="flex h-full flex-col items-start justify-between gap-2">
                    <h3 className="flex w-full items-start justify-between gap-2 text-base font-bold">
                      <div className="flex items-center gap-2">
                        {getProviderIcon(provider.driver, 'h-6 w-6')}
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
                      {provider.url && <p className="text-sm opacity-70">{provider.url}</p>}
                      {typeof provider.configuredVramGb === 'number' && !isNaN(provider.configuredVramGb) && (
                        <p className="text-sm opacity-70">VRAM: {provider.configuredVramGb} GB</p>
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
                          onChange={(e) =>
                            toggleMutation.mutate({ hostId: provider.hostId, enabled: e.target.checked })
                          }
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
                          onClick={() => handleDeleteProvider(provider.hostId)}
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
            <div className="text-3xl font-bold text-secondary">{serviceStatus.length}</div>
            <div className="mt-1 text-sm text-base-content/70">
              {serviceStatus.map((host) => host.state === 'healthy').length} healthy
            </div>
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">Total VRAM</div>
            <div className="text-3xl font-bold text-accent">
              {formatMemory(serviceStatus.reduce((prev, acc) => prev + (acc.totalMemoryMb || 0), 0))}
            </div>
            <div className="mt-1 text-sm text-base-content/70">
              {formatMemory(serviceStatus.reduce((prev, acc) => prev + (acc.usedMemoryMb || 0), 0))} used (
              {getMemoryUtilization(
                serviceStatus.reduce((prev, acc) => prev + (acc.usedMemoryMb || 0), 0),
                serviceStatus.reduce((prev, acc) => prev + (acc.totalMemoryMb || 0), 0),
              )}
              %)
            </div>
          </div>

          <div className="rounded-lg border border-base-300 bg-base-100 p-6 shadow-sm">
            <div className="mb-2 text-xs font-semibold tracking-wide text-base-content/60 uppercase">Queue Length</div>
            <div className="text-3xl font-bold text-info">?? TODO ??</div>
            <div className="mt-1 text-sm text-base-content/70">Total waiting requests</div>
          </div>
        </div>
      </div>

      {/* Ollama Instance Details */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Ollama Instance Details</h2>

        {statusWithProvider.length === 0 ? (
          <div className="rounded-lg border border-warning bg-warning/10 p-4 text-sm">
            <span>No Ollama instances found. Please check your configuration.</span>
          </div>
        ) : (
          statusWithProvider
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''))
            .map((instance) => {
              const memoryUtilization = getMemoryUtilization(instance.usedMemoryMb || 0, instance.totalMemoryMb || 0)

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
                        <div className="badge badge-outline">{instance.driver}</div>
                      </h3>
                      <p className="text-sm opacity-70">{instance.url}</p>
                      <p className="text-xs opacity-50">Version: MISSING</p>
                    </div>

                    <div className="flex flex-col gap-4 rounded-lg bg-base-200 p-4 lg:flex-row">
                      <div className="text-center">
                        <div className="text-xs font-medium text-base-content/60">VRAM Usage</div>
                        <div className="text-sm font-bold">{formatMemory(instance.usedMemoryMb || 0)}</div>
                        <div className="text-xs text-base-content/70">
                          of {formatMemory(instance.totalMemoryMb || 0)}
                        </div>
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
                            <div className="badge badge-sm badge-info">{instance.models?.length || 0}</div>
                            Available Models
                          </div>
                        </summary>
                        <div className="px-4 pb-4">
                          <div className="max-h-48 space-y-1 overflow-y-auto">
                            {instance.models && instance.models.length > 0 ? (
                              instance.models.map((model) => (
                                <div
                                  key={model.modelName}
                                  className="rounded-sm border border-base-300 bg-base-100 p-2"
                                >
                                  <div className="font-mono text-xs font-medium">{model.modelName}</div>
                                  <div className="text-xs opacity-70">
                                    <span className="mr-1 badge badge-ghost badge-xs">MODEL FAMILY</span>
                                    <span>Size: MISSING</span>
                                    <span> • MISSING params</span>
                                  </div>
                                  <div className="mt-1 flex flex-wrap gap-1">
                                    {['Embedding', 'Completion', 'Function Calling'].map((cap) => (
                                      <div key={cap} className="badge badge-outline badge-xs">
                                        {cap}
                                      </div>
                                    ))}
                                  </div>
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
                        <div className="badge badge-sm badge-success">{instance.models?.length || 0}</div>
                        Running Models
                      </h4>
                    </div>
                  </div>
                </div>
              )
            })
        )}
      </div>

      <dialog className="modal" ref={providerDialogRef}>
        <div className="modal-box w-11/12 max-w-3xl">
          <h3 className="mb-6 text-2xl font-bold">{editingProvider?.hostId ? 'Edit Provider' : 'Add Provider'}</h3>
          <form key={editingProvider?.hostId || 'new'} onSubmit={handleSubmitProvider} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-semibold">Provider Type</label>
              <select
                name="provider"
                className="select w-full"
                defaultValue={editingProvider?.driver}
                onChange={(e) => setSelectedProviderType(e.target.value)}
                disabled={!!editingProvider?.hostId}
                required
              >
                <option value="ollama">Ollama - Self-hosted LLM runtime</option>
                <option value="openai">OpenAI - GPT models</option>
              </select>
              <p className="mt-1 text-xs text-base-content/60">
                {editingProvider?.hostId
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
                    hostId: editingProvider?.hostId,
                    driver: InferenceDriverSchema.parse(selectedProviderType),
                    baseUrl: formBaseUrl || undefined,
                    apiKey: formApiKey || undefined,
                    workspaceId: user.selectedWorkspaceId,
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
                    {editingProvider?.hostId ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>{editingProvider?.hostId ? 'Update Provider' : 'Create Provider'}</>
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
