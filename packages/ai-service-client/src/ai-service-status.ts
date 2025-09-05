import { z } from 'zod'

import { classifyModel } from './model-classifier.js'
import type { OllamaInstance } from './ollama-api-types.js'
import { ollamaResourceManager } from './ollama-resource-manager.js'

export interface AiModelInfo {
  name: string
  size?: number
  digest?: string
  parameterSize?: string
  quantizationLevel?: string
  family?: string
  capabilities: string[]
}

export interface AiRunningModel {
  name: string
  size?: number
  memoryUsage?: number
  expiresAt?: string
  processingLoad?: string
  activeRequests?: number
}

export interface AiResourceUsage {
  totalMemory: number
  usedMemory: number
  availableMemory: number
  safeMemory: number
  maxConcurrency: number
  estimatedRequestMemory: number
  utilizationPercentage: number
  memoryType: string
}

export interface AiServiceInstance {
  id: string
  url: string
  type: 'OLLAMA' | 'OPENAI' | 'ANTHROPIC' | 'GEMINI'
  available: boolean
  responseTime?: number
  loadScore?: number
  runningModels: AiRunningModel[]
  availableModels: AiModelInfo[]
  resourceUsage?: AiResourceUsage
  currentConcurrency: number
  queueLength: number
  maxQueueLength?: number
  version?: string
  error?: string
  metadata?: string
}

export interface AiServiceClusterStatus {
  instances: AiServiceInstance[]
  totalInstances: number
  availableInstances: number
  healthyInstances: number
  totalMemory: number
  totalUsedMemory: number
  totalMaxConcurrency: number
  bestInstanceId?: string
  serviceTypes: Array<'OLLAMA' | 'OPENAI' | 'ANTHROPIC' | 'GEMINI'>
  lastUpdated: Date
}

// Zod schemas for API validation
const OllamaModelDetailsSchema = z.object({
  parameter_size: z.string().optional(),
  quantization_level: z.string().optional(),
  family: z.string().optional(),
})

const OllamaModelSchema = z.object({
  name: z.string(),
  size: z.number().optional(),
  digest: z.string().optional(),
  details: OllamaModelDetailsSchema.optional(),
})

const OllamaModelsResponseSchema = z.object({
  models: z.array(OllamaModelSchema).optional().default([]),
})

const OllamaVersionResponseSchema = z.object({
  version: z.string().optional(),
})

export async function getAllAiServiceInstances(): Promise<AiServiceInstance[]> {
  const ollamaInstances = await ollamaResourceManager.getInstanceList()
  const serviceInstances: AiServiceInstance[] = []

  for (const [index, instance] of ollamaInstances.entries()) {
    const instanceData = await getOllamaInstanceStatus(instance, index)
    serviceInstances.push(instanceData)
  }

  // TODO: Add support for other AI services (OpenAI, Anthropic, etc.)

  return serviceInstances
}

export async function getAiServiceClusterStatus(): Promise<AiServiceClusterStatus> {
  const instances = await getAllAiServiceInstances()

  let totalMemory = 0
  let totalUsedMemory = 0
  let totalMaxConcurrency = 0
  let availableInstances = 0
  let bestInstanceId: string | undefined
  let bestLoadScore = Infinity

  for (const instance of instances) {
    if (instance.available && instance.resourceUsage) {
      totalMemory += instance.resourceUsage.totalMemory
      totalUsedMemory += instance.resourceUsage.usedMemory
      totalMaxConcurrency += instance.resourceUsage.maxConcurrency
      availableInstances++

      if (instance.loadScore !== undefined && instance.loadScore < bestLoadScore) {
        bestLoadScore = instance.loadScore
        bestInstanceId = instance.id
      }
    }
  }

  return {
    instances,
    totalInstances: instances.length,
    availableInstances,
    healthyInstances: instances.filter((s) => s.available && !s.error).length,
    totalMemory,
    totalUsedMemory,
    totalMaxConcurrency,
    bestInstanceId,
    serviceTypes: ['OLLAMA'], // Will expand as we add more services
    lastUpdated: new Date(),
  }
}

async function getOllamaInstanceStatus(instance: OllamaInstance, index: number): Promise<AiServiceInstance> {
  const instanceId = `ollama-${index}`
  const startTime = Date.now()

  const baseInstance: AiServiceInstance = {
    id: instanceId,
    url: instance.url,
    type: 'OLLAMA',
    available: false,
    runningModels: [],
    availableModels: [],
    currentConcurrency: 0,
    queueLength: 0,
  }

  try {
    // Test instance availability and get system status
    const systemStatus = await ollamaResourceManager.getSystemStatus(instance)
    const resourceUsage = await ollamaResourceManager.calculateMemoryUsage(instance)
    const responseTime = Date.now() - startTime

    // Get available models
    const availableModels = await fetchOllamaModels(instance)

    // Get version info (if available)
    const version = await fetchOllamaVersion(instance)

    // Get semaphore info
    const semaphore = await ollamaResourceManager.getSemaphore(instance.url)
    const currentConcurrency = Math.max(0, semaphore.permitsAvailable())
    const queueLength = semaphore.queueLength()

    const loadScore = calculateLoadScore(resourceUsage)

    return {
      ...baseInstance,
      available: true,
      responseTime,
      loadScore,
      runningModels: systemStatus.models.map((model) => ({
        name: model.name,
        size: model.size,
        memoryUsage: model.size_vram || model.size,
        expiresAt: model.expires_at,
        processingLoad: undefined,
        activeRequests: undefined,
      })),
      availableModels,
      resourceUsage: {
        totalMemory: resourceUsage.totalVRAM,
        usedMemory: resourceUsage.usedVRAM,
        availableMemory: resourceUsage.availableVRAM,
        safeMemory: resourceUsage.safeVRAM,
        maxConcurrency: resourceUsage.maxConcurrency,
        estimatedRequestMemory: resourceUsage.estimatedRequestMemory,
        utilizationPercentage: (resourceUsage.usedVRAM / resourceUsage.totalVRAM) * 100,
        memoryType: 'GPU',
      },
      currentConcurrency,
      queueLength,
      maxQueueLength: 512, // OLLAMA default
      version,
      metadata: JSON.stringify({
        apiKey: !!instance.apiKey,
        weight: instance.weight,
      }),
    }
  } catch (error) {
    return {
      ...baseInstance,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

async function fetchOllamaModels(instance: OllamaInstance): Promise<AiModelInfo[]> {
  try {
    const response = await fetch(`${instance.url}/api/tags`, {
      headers: instance.apiKey ? { 'X-API-Key': instance.apiKey } : {},
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`)
    }

    const rawData = await response.json()
    const data = OllamaModelsResponseSchema.parse(rawData)
    return data.models.map((model: z.infer<typeof OllamaModelSchema>) => ({
      name: model.name,
      size: model.size || undefined,
      digest: model.digest || undefined,
      parameterSize: model.details?.parameter_size || undefined,
      quantizationLevel: model.details?.quantization_level || undefined,
      family: model.details?.family || undefined,
      capabilities: getModelCapabilities(model.name),
    }))
  } catch (error) {
    console.warn(`Failed to fetch models from ${instance.url}:`, error)
    return []
  }
}

async function fetchOllamaVersion(instance: OllamaInstance): Promise<string | undefined> {
  try {
    const response = await fetch(`${instance.url}/api/version`, {
      headers: instance.apiKey ? { 'X-API-Key': instance.apiKey } : {},
    })

    if (!response.ok) {
      return undefined
    }

    const rawData = await response.json()
    const data = OllamaVersionResponseSchema.parse(rawData)
    return data.version
  } catch {
    return undefined
  }
}

function calculateLoadScore(resourceUsage: { usedVRAM: number; totalVRAM: number; maxConcurrency: number }): number {
  const memoryUtilization = resourceUsage.usedVRAM / resourceUsage.totalVRAM
  const availabilityScore = resourceUsage.maxConcurrency
  // Lower score = better (less load, more availability)
  return memoryUtilization * 100 - availabilityScore
}

function getModelCapabilities(modelName: string): string[] {
  const classification = classifyModel(modelName)
  const capabilities: string[] = []

  if (classification.isChatModel) capabilities.push('chat')
  if (classification.isEmbeddingModel) capabilities.push('embedding')
  if (classification.isVisionModel) capabilities.push('vision')

  // Add code capability for code models (not in classifier)
  if (
    modelName.toLowerCase().includes('code') ||
    modelName.toLowerCase().includes('coder') ||
    modelName.toLowerCase().includes('starcoder')
  ) {
    capabilities.push('code')
  }

  return capabilities
}
