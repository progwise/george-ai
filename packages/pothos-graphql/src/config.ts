export const CONFIG_VARS = [
  'UPLOADS_PATH',
  'CRAWLER_CREDENTIALS_DIR',
  'PUBLIC_APP_URL',
  'GIT_COMMIT_SHA',
  'IS_PRODUCTION',
  'LOG_LEVEL',
  'OLLAMA_INSTANCES',
  'OPENAI_API_KEY',
  'OPENAI_BASE_URL',
  'SMB_CRAWLER_URL',
] as const

export type ConfigVar = (typeof CONFIG_VARS)[number]

export function getConfig(key: 'IS_PRODUCTION'): boolean
export function getConfig(key: 'OPENAI_API_KEY' | 'OPENAI_BASE_URL' | 'SMB_CRAWLER_URL'): string | undefined
export function getConfig(key: 'OLLAMA_INSTANCES'): Array<{
  baseUrl: string
  apiKey?: string
  vramGb: number
  name: string
}>
export function getConfig(
  key: 'UPLOADS_PATH' | 'CRAWLER_CREDENTIALS_DIR' | 'PUBLIC_APP_URL' | 'GIT_COMMIT_SHA' | 'LOG_LEVEL',
): string

export function getConfig(key: ConfigVar):
  | undefined
  | string
  | boolean
  | Array<{
      baseUrl: string
      apiKey?: string
      vramGb: number
      name: string
    }> {
  switch (key) {
    case 'IS_PRODUCTION':
      return process.env.NODE_ENV === 'production'
    default:
    case 'UPLOADS_PATH':
    case 'CRAWLER_CREDENTIALS_DIR':
    case 'PUBLIC_APP_URL':
    case 'GIT_COMMIT_SHA':
    case 'LOG_LEVEL':
    case 'SMB_CRAWLER_URL':
      if (!process.env[key]) {
        throw new Error(`Missing required config variable: ${key}`)
      }
      return process.env[key]

    case 'OPENAI_API_KEY':
    case 'OPENAI_BASE_URL':
      return process.env[key] || undefined
    case 'OLLAMA_INSTANCES':
      return getConfiguredOllamaInstances()
  }
}

const getConfiguredOllamaInstances = () => {
  const instances = []

  // Primary instance (OLLAMA_BASE_URL)
  const primaryBaseUrl = process.env.OLLAMA_BASE_URL
  if (primaryBaseUrl) {
    instances.push({
      baseUrl: primaryBaseUrl,
      apiKey: process.env.OLLAMA_API_KEY,
      vramGb: parseInt(process.env.OLLAMA_VRAM_GB ?? '16', 10),
      name: 'Primary Ollama',
    })
  }

  // Additional instances (OLLAMA_BASE_URL_1 through OLLAMA_BASE_URL_9)
  for (let i = 1; i <= 9; i++) {
    const baseUrl = process.env[`OLLAMA_BASE_URL_${i}`]
    if (baseUrl) {
      instances.push({
        baseUrl,
        apiKey: process.env[`OLLAMA_API_KEY_${i}`],
        vramGb: parseInt(process.env[`OLLAMA_VRAM_GB_${i}`] ?? '16', 10),
        name: `Ollama Instance ${i + 1}`,
      })
    }
  }

  return instances
}

export default getConfig
