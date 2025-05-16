import { CallbackManagerForLLMRun } from '@langchain/core/callbacks/manager'
import {
  BaseChatModel,
  BaseChatModelCallOptions,
  BaseChatModelParams,
} from '@langchain/core/language_models/chat_models'
import { AIMessageChunk, ChatMessage } from '@langchain/core/messages'
import { ChatResult } from '@langchain/core/outputs'

import { localLLMConfig } from './local-llm-settings'

interface ChatLocalMLXOptions extends BaseChatModelParams {
  endpoint: string
  model?: string
  maxTokens?: number
  temperature?: number
}

function cleanModelOutput(text: string): string {
  return text
    .split('\n')
    .filter(
      (line) =>
        !line.startsWith('==========') &&
        !line.startsWith('Prompt:') &&
        !line.startsWith('Generation:') &&
        !line.startsWith('Peak memory:') &&
        !line.startsWith('[Process exited with code') &&
        line.trim() !== '',
    )
    .join('\n')
}

export class ChatLocalMLX extends BaseChatModel<BaseChatModelCallOptions, AIMessageChunk> {
  static lc_name() {
    return 'ChatLocalMLX'
  }

  endpoint: string
  model: string
  maxTokens: number
  temperature: number

  constructor(fields: ChatLocalMLXOptions) {
    super({})
    this.endpoint = fields.endpoint
    this.model = fields.model || localLLMConfig.modelName
    this.maxTokens = fields.maxTokens || localLLMConfig.maxTokens
    this.temperature = fields.temperature || localLLMConfig.temperature
  }

  _llmType(): string {
    return 'local-mlx'
  }

  async _call(
    messages: ChatMessage[],
    _opts: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<string> {
    const prompt = messages.map((m) => m.content).join('\n')
    console.log('➡️ [ChatLocalMLX] Sending prompt to local MLX API:', {
      endpoint: this.endpoint,
      model: this.model,
      prompt,
      maxTokens: this.maxTokens,
      temperature: this.temperature,
    })

    let res: Response
    try {
      res = await fetch(this.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.model,
          prompt,
          maxTokens: this.maxTokens,
          temperature: this.temperature,
        }),
      })
    } catch (err) {
      console.error('[ChatLocalMLX] Could not reach local MLX API:', err)
      throw new Error(`Failed to reach local MLX API: ${err}`)
    }

    if (!res.ok) {
      const errorText = await res.text()
      console.error(`[ChatLocalMLX] MLX API error: ${res.status}: ${errorText}`)
      throw new Error(`Local MLX API returned ${res.status}: ${errorText}`)
    }

    // --- STREAMING SUPPORT ---
    let text = ''
    if (res.body && typeof window !== 'undefined') {
      // Browser: Stream response using ReadableStream
      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        const cleaned = cleanModelOutput(chunk)
        text += cleaned
        if (runManager?.handleLLMNewToken) {
          await runManager.handleLLMNewToken(cleaned)
        }
      }
    } else {
      // Node.js or fallback: read all at once
      const rawText = await res.text()
      text = cleanModelOutput(rawText)
      if (runManager?.handleLLMNewToken) {
        await runManager.handleLLMNewToken(text)
      }
    }
    return text
  }

  async _generate(
    messages: ChatMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    const text = await this._call(messages, options, runManager)
    return {
      generations: [
        {
          text,
          message: new AIMessageChunk({ content: text }),
        },
      ],
    }
  }
}
