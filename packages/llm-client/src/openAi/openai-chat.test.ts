import { createReadStream } from 'fs'
import { Readable } from 'stream'

import { encryptValue } from '@george-ai/app-commons'
import { ChatAttachment, ChatMessage, ChatResponseChunk, OpenAIHostConnection } from '@george-ai/app-schema'
import { getTestAssetLocalPath } from '@george-ai/test-utils/src/test-files'

import { getOpenAIChatCompletion, getOpenAIChatCompletionStream, openAIChatJsonGenerator } from './get-chat-completion'

const GITHUB_TOKEN = process.env['GITHUB_TOKEN']

const OPENAI_API_KEY = process.env['OPENAI_API_KEY']

const readJsonGenerator = async (options: {
  messages: ChatMessage[]
  model: string
  stream: boolean
  attachments?: (ChatAttachment & { stream: Readable })[]
}) => {
  const chunks: Uint8Array[] = []

  const generator = openAIChatJsonGenerator(options)

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

describe('Testing openAI chat endpoints', () => {
  const openAIConnection: OpenAIHostConnection | null = !OPENAI_API_KEY
    ? null
    : {
        driver: 'openai',
        baseUrl: 'https://api.openai.com/v1',
        encryptedApiKey: encryptValue(OPENAI_API_KEY),
      }
  it('Testing the json generator without attachment', async () => {
    const result = await readJsonGenerator({
      messages: [
        {
          role: 'user',
          content: 'Why not?',
        },
      ],
      model: 'test-model',
      stream: false,
      attachments: undefined,
    })
    const raw = new TextDecoder().decode(result)
    const json = JSON.parse(raw)

    expect(json).toBeDefined()
    expect(json.messages).toBeDefined()
    expect(json.messages.length).toBe(1)
    expect(raw).not.toContain('image_url')
  })
  it('Testing the json generator with attachments', async () => {
    const result = await readJsonGenerator({
      messages: [
        {
          role: 'system',
          content: 'User Why not with attachments?',
        },
        {
          role: 'system',
          content: 'System Why not with attachments?',
        },
      ],
      model: 'test-model',
      stream: false,
      attachments: [
        {
          fileName: 'test-file1.txt',
          mimeType: 'image/png',
          uri: 'testuri',
          stream: Readable.from(['happy', 'streaming']),
        },
      ],
    })
    const raw = new TextDecoder().decode(result)
    const json = JSON.parse(raw)

    expect(json).toBeDefined()
    expect(json.messages).toBeDefined()
    expect(json.messages.length).toBe(3)
    expect(raw).toContain('image_url')
  })

  describe.skipIf(!GITHUB_TOKEN || !openAIConnection)('Test real images for OLLAMA chat completion', () => {
    it('should provide a description of a real test attachment', async () => {
      const filePath = await getTestAssetLocalPath('vancouver-medium.png')

      const readStream = createReadStream(filePath)

      const result = await getOpenAIChatCompletion(
        openAIConnection!,
        'gpt-5-nano',
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

      const searchFor = ['vancouver', 'city', 'skyline', 'mountains', 'harbour', 'urban', 'building']
      expect(searchFor.some((term) => result.chunk.includes(term))).toBe(true)
    })

    it('Testing a second image to be sure', async () => {
      const filePath = await getTestAssetLocalPath('cat-medium.png')

      const readStream = createReadStream(filePath)

      const result = await getOpenAIChatCompletion(
        openAIConnection!,
        'gpt-5-nano',
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
      expect(result.chunk).not.toContain('city')
      expect(result.chunk).toContain('cat')
    })

    it('Testing streaming endpoint', async () => {
      const filePath = await getTestAssetLocalPath('cat-medium.png')

      const readStream = createReadStream(filePath)

      const stream = await getOpenAIChatCompletionStream(
        openAIConnection!,
        'gpt-5-nano',
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

      const resultContent = bufferedResult.map((c) => c.chunk || '').join('')
      expect(resultContent).toBeDefined()
      expect(resultContent).toContain('cat')
      expect(resultContent).not.toContain('city')
    })
  })
})
