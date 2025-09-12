import { BaseChatModel, BaseChatModelCallOptions } from '@langchain/core/language_models/chat_models'
import { AIMessageChunk } from '@langchain/core/messages'

export type AssistantModel = BaseChatModel<BaseChatModelCallOptions, AIMessageChunk>
