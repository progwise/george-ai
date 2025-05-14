// File: packages/langchain-chat/src/assistant-model.ts

import { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models';
import { AIMessageChunk } from '@langchain/core/messages';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatOllama } from '@langchain/ollama';
import { ChatOpenAI } from '@langchain/openai';
import { ChatLocalMLX } from './local-mlx-llm';
import { localLLMConfig } from './local-llm-settings';

export type SupportedModel =
  | 'gpt-3'
  | 'gpt-4'
  | 'gemini-1.5'
  | 'ollama-mistral'
  | 'ollama-llama3.1'
  | 'local-mlx-api';

export type AssistantModel = BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>;

const models = new Map<string, AssistantModel>();

export const getModel = (
  languageModel: SupportedModel,
  overrides?: Partial<{ model: string; endpoint: string; maxTokens: number; temperature: number }>,
): AssistantModel => {
  const cacheKey = overrides?.model ? `${languageModel}:${overrides.model}` : languageModel;

  if (models.has(cacheKey)) {
    return models.get(cacheKey)!;
  }

  const model = getNewModelInstance(languageModel, overrides);
  models.set(cacheKey, model);
  return model;
};

const getNewModelInstance = (
  languageModel: SupportedModel,
  overrides?: Partial<{ model: string; endpoint: string; maxTokens: number; temperature: number }>,
): AssistantModel => {
  switch (languageModel) {
    case 'gpt-3':
      return new ChatOpenAI({
        modelName: 'gpt-3',
        temperature: 0.7,
        maxTokens: 500,
      });
    case 'gpt-4':
      return new ChatOpenAI({
        modelName: 'gpt-4o-mini',
        temperature: 0.7,
        maxTokens: 500,
      });
    case 'gemini-1.5':
      return new ChatGoogleGenerativeAI({
        model: 'gemini-1.5-pro',
        temperature: 0,
        maxRetries: 2,
      });
    case 'ollama-mistral':
      return new ChatOllama({
        baseUrl: process.env.OLLAMA_BASE_URL,
        model: 'mistral:latest',
      });
    case 'ollama-llama3.1':
      return new ChatOllama({
        model: 'llama3.1:latest',
        baseUrl: process.env.OLLAMA_BASE_URL,
      });
    case 'local-mlx-api':
      return new ChatLocalMLX({
        endpoint: overrides?.endpoint || localLLMConfig.endpoint,
        model: overrides?.model || localLLMConfig.modelName,
        maxTokens: overrides?.maxTokens || localLLMConfig.maxTokens,
        temperature: overrides?.temperature || localLLMConfig.temperature,
      });
    default:
      throw new Error(`Unknown language model: ${languageModel}`);
  }
};
