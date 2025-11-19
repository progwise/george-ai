import { SystemMessage } from '@langchain/core/messages'

import type { ServiceProviderType } from '@george-ai/ai-service-client'

import { Library } from './library'

export interface Assistant {
  id: string
  name: string
  description: string | null
  languageModelProvider: ServiceProviderType
  languageModel: string
  baseCases: Array<{ condition?: string | null; instruction?: string | null }>
}

export const getAssistantBaseMessages = (input: { assistant: Assistant; libraries: Library[] }) => [
  new SystemMessage({
    content: `You are a helpful assistant and you have a name.
      Your name is ${input.assistant.name}.
      Your description is ${!input.assistant.description || input.assistant.description.length < 1 ? 'No description for this assistant' : input.assistant.description}.
      `,
  }),
  new SystemMessage({ content: `Today is the ${new Date(Date.now()).toDateString()}` }),
  ...input.libraries.map(
    (library) =>
      new SystemMessage({
        content: `You have access to the following library:
      name: ${library.name}
      description: ${!library.description || library.description.length < 1 ? 'No description for library ' + library.name : library.description}`,
      }),
  ),
  ...input.assistant.baseCases.map(
    (baseCase) =>
      new SystemMessage({
        content: `You have the following conditional instruction:
      condition: ${baseCase.condition}
      instructions: ${baseCase.instruction}
      If the condition is empty you must follow the instruction and behave like the condition is met`,
      }),
  ),
]
