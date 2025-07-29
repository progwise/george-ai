import fs from 'fs'
import path from 'path'

export type ChatTemplateType = 'chatml' | 'gemma' | 'mistral' | 'llama' | 'qwen' | 'alpaca' | 'zephyr'

export interface QAPair {
  prompt: string
  completion: string
  sourceDocument?: string
  chunkIndex?: number
  section?: string
  category?: string[] | string
  difficulty?: string[] | string
}

export interface FormattedTrainingExample {
  text?: string
  messages?: Array<{ role: string; content: string }>
  prompt?: string
  completion?: string
}

// Chat template definitions
export const CHAT_TEMPLATES = {
  chatml: {
    format: (prompt: string, completion: string) => ({
      messages: [
        { role: 'user', content: prompt },
        { role: 'assistant', content: completion },
      ],
    }),
  },

  gemma: {
    format: (prompt: string, completion: string) => ({
      text: `<start_of_turn>user\n${prompt}<end_of_turn>\n<start_of_turn>model\n${completion}<end_of_turn>`,
    }),
  },

  mistral: {
    format: (prompt: string, completion: string) => ({
      text: `[INST] ${prompt} [/INST] ${completion}`,
    }),
  },

  llama: {
    format: (prompt: string, completion: string) => ({
      text: `<s>[INST] ${prompt} [/INST] ${completion} </s>`,
    }),
  },

  qwen: {
    format: (prompt: string, completion: string) => ({
      text: `<|im_start|>user\n${prompt}<|im_end|>\n<|im_start|>assistant\n${completion}<|im_end|>`,
    }),
  },

  alpaca: {
    format: (prompt: string, completion: string) => ({
      text: `### Instruction:\n${prompt}\n\n### Response:\n${completion}`,
    }),
  },

  zephyr: {
    format: (prompt: string, completion: string) => ({
      text: `<|user|>\n${prompt}</s>\n<|assistant|>\n${completion}</s>`,
    }),
  },
} as const

// Model to template mapping
export const MODEL_TEMPLATE_MAPPING: Record<string, ChatTemplateType> = {
  'google/gemma-3-12b-it': 'gemma',
  'google/gemma-2-7b-it': 'gemma',
  'google/gemma-2-9b-it': 'gemma',
  'mistralai/mistral-7b-instruct': 'mistral',
  'meta-llama/llama-2-7b-chat': 'llama',
  'meta-llama/llama-3.1-8b-instruct': 'llama',
  'qwen/qwen2.5-7b-instruct': 'qwen',
  'microsoft/dialoGPT-medium': 'chatml',
  'huggingfaceh4/zephyr-7b-beta': 'zephyr',
  'tatsu-lab/alpaca-7b': 'alpaca',
}

/**
 * Format a QA pair according to the specified chat template
 */
export function formatQAPairForTraining(
  qaPair: QAPair,
  template: ChatTemplateType = 'chatml',
): FormattedTrainingExample {
  const formatter = CHAT_TEMPLATES[template]
  if (!formatter) {
    throw new Error(`Unknown chat template: ${template}`)
  }

  const formatted = formatter.format(qaPair.prompt, qaPair.completion)

  // Add metadata if available
  const result: FormattedTrainingExample = { ...formatted }

  return result
}

/**
 * Format multiple QA pairs for training
 */
export function formatQAPairsForTraining(
  qaPairs: QAPair[],
  template: ChatTemplateType = 'chatml',
): FormattedTrainingExample[] {
  return qaPairs.map((qaPair) => formatQAPairForTraining(qaPair, template))
}

/**
 * Detect chat template from model name
 */
export function detectChatTemplateFromModel(modelName: string): ChatTemplateType {
  // Check exact matches first
  if (MODEL_TEMPLATE_MAPPING[modelName]) {
    return MODEL_TEMPLATE_MAPPING[modelName]
  }

  // Check partial matches
  const lowerModelName = modelName.toLowerCase()

  if (lowerModelName.includes('gemma')) return 'gemma'
  if (lowerModelName.includes('mistral')) return 'mistral'
  if (lowerModelName.includes('llama')) return 'llama'
  if (lowerModelName.includes('qwen')) return 'qwen'
  if (lowerModelName.includes('alpaca')) return 'alpaca'
  if (lowerModelName.includes('zephyr')) return 'zephyr'

  // Default fallback
  console.warn(`Unknown model ${modelName}, using ChatML template as fallback`)
  return 'chatml'
}

/**
 * Read fine-tuning config and detect the base model template
 */
export function detectTemplateFromConfig(configPath: string): ChatTemplateType {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    const baseModel = config.base_model || config.model_name || ''
    return detectChatTemplateFromModel(baseModel)
  } catch (error) {
    console.error(`Failed to read config from ${configPath}:`, error)
    return 'chatml' // Default fallback
  }
}

/**
 * Convert formatted training examples to JSONL format
 */
export function toJSONL(examples: FormattedTrainingExample[]): string {
  return examples.map((example) => JSON.stringify(example)).join('\n')
}

/**
 * Create training data files for multiple templates
 */
export function createMultiTemplateTrainingData(
  qaPairs: QAPair[],
  templates: ChatTemplateType[] = ['chatml', 'gemma'],
  outputDir: string = '/workspaces/george-ai/apps/fine-tuning/jsonl/formatted',
): Record<ChatTemplateType, string> {
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true })
  }

  const filePaths: Partial<Record<ChatTemplateType, string>> = {}

  templates.forEach((template) => {
    const formattedData = formatQAPairsForTraining(qaPairs, template)
    const jsonlContent = toJSONL(formattedData)
    const filePath = path.join(outputDir, `qa-data-${template}.jsonl`)

    fs.writeFileSync(filePath, jsonlContent)
    filePaths[template] = filePath

    console.log(`Created ${template} training data: ${filePath} (${formattedData.length} examples)`)
  })

  return filePaths as Record<ChatTemplateType, string>
}

/**
 * Convert existing raw QA data to formatted chat templates
 */
export function convertExistingQAData(
  rawDataPath: string = '/workspaces/george-ai/apps/fine-tuning/jsonl/raw/qa-data.jsonl',
  outputDir: string = '/workspaces/george-ai/apps/fine-tuning/jsonl/formatted',
  templates: ChatTemplateType[] = ['chatml', 'gemma'],
): Record<ChatTemplateType, string> {
  if (!fs.existsSync(rawDataPath)) {
    throw new Error(`Raw QA data file not found: ${rawDataPath}`)
  }

  // Read and parse existing QA data
  const rawData = fs.readFileSync(rawDataPath, 'utf8')
  const qaPairs: QAPair[] = rawData
    .split('\n')
    .filter((line) => line.trim())
    .map((line) => {
      try {
        return JSON.parse(line) as QAPair
      } catch {
        console.warn('Failed to parse line:', line)
        return null
      }
    })
    .filter((item): item is QAPair => item !== null)

  console.log(`Converting ${qaPairs.length} QA pairs to chat templates`)

  return createMultiTemplateTrainingData(qaPairs, templates, outputDir)
}
