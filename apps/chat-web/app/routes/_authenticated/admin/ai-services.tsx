import { useSuspenseQuery } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

import { getAiServiceStatusQueryOptions } from '../../../components/admin/ai-services/get-ai-service-status'

export const Route = createFileRoute('/_authenticated/admin/ai-services')({
  component: AiServicesAdminPage,
  loader: async ({ context }) => {
    await Promise.all([context.queryClient.ensureQueryData(getAiServiceStatusQueryOptions())])
  },
})

function AiServicesAdminPage() {
  const { queryClient } = Route.useRouteContext()
  const [autoRefresh, setAutoRefresh] = useState(false)

  // Use suspense query - data is guaranteed to be available
  const { data: serviceStatus } = useSuspenseQuery({
    ...getAiServiceStatusQueryOptions(),
    refetchInterval: autoRefresh ? 5000 : false, // Override refetch interval for auto-refresh
  })

  // Manual refresh function
  const handleRefresh = () => {
    queryClient.invalidateQueries(getAiServiceStatusQueryOptions())
  }

  // Format memory values for display
  const formatMemory = (bytes: number) => {
    const gb = bytes / (1024 * 1024 * 1024)
    return `${gb.toFixed(1)} GB`
  }

  // Format load score for display
  const formatLoadScore = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'N/A'
    return score.toFixed(1)
  }

  // Get status badge classes
  const getStatusBadge = (available: boolean, error: string | null | undefined) => {
    if (error) return 'badge-error'
    return available ? 'badge-success' : 'badge-warning'
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">AI Services Administration</h1>
        <div className="flex gap-2">
          <label className="label cursor-pointer">
            <input
              type="checkbox"
              className="checkbox checkbox-primary"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
            />
            <span className="label-text ml-2">Auto Refresh (5s)</span>
          </label>
          <button className="btn btn-primary" onClick={handleRefresh} type="button">
            Refresh Now
          </button>
        </div>
      </div>

      {/* Cluster Overview */}
      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Instances</div>
          <div className="stat-value text-primary">{serviceStatus.totalInstances}</div>
          <div className="stat-desc">
            {serviceStatus.availableInstances} available, {serviceStatus.healthyInstances} healthy
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total Memory</div>
          <div className="stat-value text-secondary">{formatMemory(serviceStatus.totalMemory)}</div>
          <div className="stat-desc">{formatMemory(serviceStatus.totalUsedMemory)} used</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Max Concurrency</div>
          <div className="stat-value text-accent">{serviceStatus.totalMaxConcurrency}</div>
          <div className="stat-desc">Across all instances</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Best Instance</div>
          <div className="stat-value text-sm">{serviceStatus.bestInstanceId || 'N/A'}</div>
          <div className="stat-desc">Lowest load score</div>
        </div>
      </div>

      {/* Service Types */}
      <div className="mb-6">
        <h2 className="mb-2 text-xl font-semibold">Service Types</h2>
        <div className="flex gap-2">
          {serviceStatus.serviceTypes.map((type) => (
            <div key={type} className="badge badge-outline badge-lg">
              {type}
            </div>
          ))}
        </div>
      </div>

      {/* Individual Instances */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Service Instances</h2>

        {serviceStatus.instances.map((instance) => (
          <div key={instance.id} className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="mb-4 flex items-start justify-between">
                <div>
                  <h3 className="card-title">
                    {instance.id}
                    <div className={`badge ${getStatusBadge(instance.available, instance.error)}`}>
                      {instance.error ? 'Error' : instance.available ? 'Online' : 'Offline'}
                    </div>
                    <div className="badge badge-outline">{instance.type}</div>
                  </h3>
                  <p className="text-sm opacity-70">{instance.url}</p>
                  {instance.version && <p className="text-xs opacity-50">Version: {instance.version}</p>}
                </div>
                <div className="stats stats-horizontal bg-base-200 text-center">
                  <div className="stat px-4 py-2">
                    <div className="stat-title text-xs">Response Time</div>
                    <div className="stat-value text-sm">
                      {instance.responseTime ? `${instance.responseTime.toFixed(0)}ms` : 'N/A'}
                    </div>
                  </div>
                  <div className="stat px-4 py-2">
                    <div className="stat-title text-xs">Load Score</div>
                    <div className="stat-value text-sm">{formatLoadScore(instance.loadScore)}</div>
                  </div>
                  <div className="stat px-4 py-2">
                    <div className="stat-title text-xs">Queue</div>
                    <div className="stat-value text-sm">
                      {instance.queueLength}/{instance.maxQueueLength || '?'}
                    </div>
                  </div>
                </div>
              </div>

              {instance.error && (
                <div className="alert alert-error mb-4">
                  <span className="text-sm">{instance.error}</span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Resource Usage */}
                {instance.resourceUsage && (
                  <div>
                    <h4 className="mb-2 font-semibold">Resource Usage ({instance.resourceUsage.memoryType})</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Total Memory:</span>
                        <span>{formatMemory(instance.resourceUsage.totalMemory)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Used Memory:</span>
                        <span>{formatMemory(instance.resourceUsage.usedMemory)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Available Memory:</span>
                        <span>{formatMemory(instance.resourceUsage.availableMemory)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Utilization:</span>
                        <span>{instance.resourceUsage.utilizationPercentage.toFixed(1)}%</span>
                      </div>
                      <progress
                        className="progress progress-primary w-full"
                        value={instance.resourceUsage.utilizationPercentage}
                        max="100"
                      ></progress>
                      <div className="flex justify-between text-sm">
                        <span>Max Concurrency:</span>
                        <span>{instance.resourceUsage.maxConcurrency}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Current Concurrency:</span>
                        <span>{instance.currentConcurrency}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Running Models */}
                <div>
                  <h4 className="mb-2 font-semibold">Running Models ({instance.runningModels?.length || 0})</h4>
                  <div className="max-h-40 space-y-1 overflow-y-auto">
                    {instance.runningModels && instance.runningModels.length > 0 ? (
                      instance.runningModels.map((model) => (
                        <div key={model.name} className="bg-base-200 flex justify-between rounded p-2 text-sm">
                          <span className="font-mono">{model.name}</span>
                          <span>{model.memoryUsage ? formatMemory(model.memoryUsage) : 'N/A'}</span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm opacity-50">No running models</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Available Models */}
              <div className="mt-4">
                <div className="collapse-arrow bg-base-200 collapse">
                  <input type="checkbox" />
                  <div className="collapse-title text-sm font-medium">
                    Available Models ({instance.availableModels?.length || 0})
                  </div>
                  <div className="collapse-content">
                    <div className="grid max-h-60 grid-cols-1 gap-2 overflow-y-auto md:grid-cols-2">
                      {instance.availableModels && instance.availableModels.length > 0 ? (
                        instance.availableModels.map((model) => (
                          <div key={model.name} className="bg-base-100 rounded p-2">
                            <div className="font-mono text-sm">{model.name}</div>
                            <div className="text-xs opacity-70">
                              {model.family && <span>Family: {model.family} | </span>}
                              {model.size !== undefined && model.size !== null && (
                                <span>Size: {formatMemory(model.size)} | </span>
                              )}
                              Capabilities: {model.capabilities?.join(', ') || 'Unknown'}
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm opacity-50">No available models</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {serviceStatus.instances.length === 0 && (
        <div className="alert alert-warning">
          <span>No AI service instances found. Please check your configuration.</span>
        </div>
      )}

      <div className="mt-8 text-center text-sm opacity-50">
        Last updated: {new Date(serviceStatus.lastUpdated).toLocaleString()}
      </div>
    </div>
  )
}
