import { createReadStream } from 'fs'
import { Readable } from 'stream'

import { encryptValue } from '@george-ai/app-commons'
import { ChatAttachment, ChatMessage, ChatResponseChunk, OllamaHostConnection } from '@george-ai/app-schema'
import { getTestAssetLocalPath } from '@george-ai/test-utils'

import '../common'

import {
  getOllamaChatCompletion,
  getOllamaChatCompletionStream,
  ollamaChatJsonBodyGenerator,
} from './get-chat-completion'

const GITHUB_TOKEN = process.env['GITHUB_TOKEN']
const OLLAMA_BASE_URL = process.env['OLLAMA_BASE_URL']
const OLLAMA_API_KEY = process.env['OLLAMA_API_KEY']

const readGenerator = async (options: {
  messages: ChatMessage[]
  model: string
  stream: boolean
  attachments?: (ChatAttachment & { stream: Readable })[]
}) => {
  const chunks: Uint8Array[] = []

  const generator = ollamaChatJsonBodyGenerator(options)

  for await (const chunk of generator) {
    chunks.push(chunk)
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)

  const result = new Uint8Array(totalLength)

  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }

  return result
}

describe.skipIf(!OLLAMA_BASE_URL)('Testing Ollama chat endpoints', () => {
  const ollamaConnection: OllamaHostConnection | null = !OLLAMA_BASE_URL
    ? null
    : {
        driver: 'ollama',
        baseUrl: OLLAMA_BASE_URL,
        encryptedApiKey: encryptValue(OLLAMA_API_KEY),
      }
  it('Testing the json generator without attachments', async () => {
    const result = await readGenerator({
      messages: [
        {
          role: 'system',
          content: 'why not',
        },
      ],
      model: 'test-model',
      stream: false,
      attachments: [],
    })

    const raw = new TextDecoder().decode(result)
    const json = JSON.parse(raw)
    expect(json).toBeDefined()
    expect(json.messages.length).toBe(1)
    expect(json.messages[0].images).toBeDefined()
  })

  it('Testing the json generator with attachments', async () => {
    const result = await readGenerator({
      messages: [
        {
          role: 'system',
          content: 'why not',
        },
        {
          role: 'system',
          content: 'why not again....',
        },
      ],
      model: 'test-model',
      stream: false,
      attachments: [
        {
          fileName: 'test23.jpg',
          mimeType: 'image/jpeg',
          uri: 'testuri',
          stream: Readable.from(['love', 'is', 'relative']),
        },
        {
          fileName: 'test34.png',
          mimeType: 'image/png',
          uri: 'testuri',
          stream: Readable.from(['why', 'is', 'hate', 'absolute', '?']),
        },
      ],
    })

    const raw = new TextDecoder().decode(result)
    const json = JSON.parse(raw)
    expect(json).toBeDefined()
    expect(json.messages.length).toBe(2)
    expect(json.messages[1]).toBeDefined()
    expect(json.messages[1].images).toBeDefined()
    expect(json.messages[1].images.length).toBe(2)
  })

  it('Testing the chat completion endpoint without attachments', async () => {
    const result = await getOllamaChatCompletion(
      ollamaConnection!,
      'gemma3:latest',

      [
        {
          role: 'system',
          content: 'why not',
        },
      ],
      [],
    )

    expect(result).toBeDefined()
    expect(result.completionLine).toBeDefined()
    expect(result.completionLine!.length).toBeGreaterThan(0)
  })

  describe.skipIf(!GITHUB_TOKEN || !ollamaConnection)('Test real images for OLLAMA chat completion', () => {
    it('should provide a description of a real test attachment', async () => {
      const filePath = await getTestAssetLocalPath('vancouver-medium.png')

      const readStream = createReadStream(filePath)

      const result = await getOllamaChatCompletion(
        ollamaConnection!,
        'gemma3:latest',
        [
          {
            role: 'user',
            content: 'Please describe the image.',
          },
        ],
        [
          {
            fileName: 'example.png',
            mimeType: 'image/png',
            uri: 'testuri',
            stream: readStream,
          },
        ],
      )
      expect(result).toBeDefined()
      const searchFor = ['vancouver', 'city', 'skyline', 'mountains', 'harbour', 'urban', 'building']
      expect(searchFor.some((term) => result.completionLine!.includes(term))).toBe(true)
    })

    it('Testing a second image to be sure', async () => {
      const filePath = await getTestAssetLocalPath('cat-medium.png')

      const readStream = createReadStream(filePath)

      const result = await getOllamaChatCompletion(
        ollamaConnection!,
        'gemma3:latest',
        [
          {
            role: 'user',
            content: 'Please describe the image.',
          },
        ],
        [
          {
            fileName: 'example.png',
            mimeType: 'image/png',
            uri: 'testuri',
            stream: readStream,
          },
        ],
      )
      expect(result).toBeDefined()
      expect(result.completionLine).not.toContain('city')

      const searchFor = ['cat', 'relax', 'sunny', 'sleepy', 'cute']
      expect(searchFor.some((term) => result.completionLine!.includes(term))).toBe(true)
    })

    it('Testing streaming endpoint', async () => {
      const filePath = await getTestAssetLocalPath('n8n-agent.png')

      const readStream = createReadStream(filePath)

      const stream = await getOllamaChatCompletionStream(
        ollamaConnection!,
        'gemma3:latest',
        [
          {
            role: 'user',
            content: 'Please describe the image.',
          },
        ],
        [
          {
            fileName: 'example.png',
            mimeType: 'image/png',
            uri: 'testuri',
            stream: readStream,
          },
        ],
      )

      const bufferedResult: Array<ChatResponseChunk> = []
      for await (const chunk of stream) {
        bufferedResult.push(chunk)
      }

      const resultContent = bufferedResult.map((c) => c.completionLine || '').join('')
      expect(resultContent).toBeDefined()

      expect(resultContent).not.toContain('city')

      const searchFor = ['diagram', 'agent', 'user', 'assistant', 'flowchart']
      expect(searchFor.some((term) => resultContent.includes(term))).toBe(true)
    })
  })
})
