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
}

export class ChatLocalMLX extends BaseChatModel<BaseChatModelCallOptions, AIMessageChunk> {
  static lc_name() {
    return 'ChatLocalMLX'
  }

  endpoint: string

  constructor(fields: ChatLocalMLXOptions) {
    super(fields)
    this.endpoint = fields.endpoint
  }

  _llmType(): string {
    return 'local-mlx'
  }

  async _call(
    messages: ChatMessage[],
    _options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<string> {
    const prompt = messages.map((m) => m.content).join('\n')

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: localLLMConfig.modelName,
        prompt,
        maxTokens: localLLMConfig.maxTokens,
        temperature: localLLMConfig.temperature,
      }),
    })

    if (!res.ok) {
      throw new Error(`Local MLX API returned ${res.status}`)
    }

    const text = await res.text()
    await runManager?.handleLLMNewToken?.(text)
    return text
  }

  async _generate(
    messages: ChatMessage[],
    options: this['ParsedCallOptions'],
    runManager?: CallbackManagerForLLMRun,
  ): Promise<ChatResult> {
    const text = await this._call(messages, options, runManager)
    return {
      generations: [{ text, message: new AIMessageChunk({ content: text }) }],
    }
  }
}
