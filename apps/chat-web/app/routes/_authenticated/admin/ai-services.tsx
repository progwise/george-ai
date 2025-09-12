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

  // Calculate memory utilization percentage
  const getMemoryUtilization = (used: number, total: number) => {
    if (total === 0) return 0
    return Math.round((used / total) * 100)
  }

  // Get status badge classes
  const getStatusBadge = (isOnline: boolean) => {
    return isOnline ? 'badge-success' : 'badge-error'
  }

  // Get utilization color based on percentage
  const getUtilizationColor = (percentage: number) => {
    if (percentage < 50) return 'progress-success'
    if (percentage < 80) return 'progress-warning'
    return 'progress-error'
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Ollama Service Administration</h1>
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
          <div className="stat-title">Instances</div>
          <div className="stat-value text-primary">{serviceStatus.totalInstances}</div>
          <div className="stat-desc">
            {serviceStatus.availableInstances} available • {serviceStatus.healthyInstances} healthy
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Total VRAM</div>
          <div className="stat-value text-secondary">{formatMemory(serviceStatus.totalMemory)}</div>
          <div className="stat-desc">
            {formatMemory(serviceStatus.totalUsedMemory)} used (
            {getMemoryUtilization(serviceStatus.totalUsedMemory, serviceStatus.totalMemory)}%)
          </div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Max Concurrency</div>
          <div className="stat-value text-accent">{serviceStatus.totalMaxConcurrency}</div>
          <div className="stat-desc">Across all instances</div>
        </div>

        <div className="stat bg-base-200 rounded-lg">
          <div className="stat-title">Queue Length</div>
          <div className="stat-value text-info">{serviceStatus.totalQueueLength}</div>
          <div className="stat-desc">Total waiting requests</div>
        </div>
      </div>

      {/* Individual Instances */}
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Ollama Instances</h2>

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
                    {/* Instance Header */}
                    <div className="mb-4 flex items-start justify-between">
                      <div>
                        <h3 className="card-title">
                          {instance.name}
                          <div className={`badge ${getStatusBadge(instance.isOnline)}`}>
                            {instance.isOnline ? 'Online' : 'Offline'}
                          </div>
                          <div className="badge badge-outline">{instance.type}</div>
                        </h3>
                        <p className="text-sm opacity-70">{instance.url}</p>
                        {instance.version && <p className="text-xs opacity-50">Version: {instance.version}</p>}
                      </div>

                      {/* Memory Stats */}
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

                    {/* Content Grid */}
                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      {/* Available Models (Collapsible) */}
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

                      {/* Running Models */}
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
                                      <span>Expires: {new Date(model.expiresAt).toLocaleTimeString()}</span>
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

                      {/* Model Queues */}
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

      <div className="mt-8 text-center text-sm opacity-50">Last updated: {new Date().toLocaleString()}</div>
    </div>
  )
}
