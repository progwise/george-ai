export interface OllamaModelInfo {
  name: string
  model: string
  size: number
  digest: string
  details: {
    parent_model: string
    format: string
    family: string
    families: string[]
    parameter_size: string
    quantization_level: string
  }
  expires_at: string
  size_vram: number
}

export interface OllamaProcessInfo {
  name: string
  id: string
  size: number
  size_vram: number
  expires_at: string
}

export interface OllamaSystemStatus {
  models: OllamaProcessInfo[]
}

export interface OllamaInstance {
  url: string
  apiKey?: string
  weight: number // For load balancing
  vramGB?: number // VRAM/unified memory in GB for this instance
  availableModels?: string[] // Cached list of available models
}

export interface MemoryUsage {
  totalVRAM: number // Total GPU memory in bytes
  usedVRAM: number // Currently used VRAM
  availableVRAM: number // Available for new requests
  safeVRAM: number // Available minus safety buffer
  estimatedRequestMemory: number // Memory per concurrent request
  maxConcurrency: number // Safe concurrent requests
}
