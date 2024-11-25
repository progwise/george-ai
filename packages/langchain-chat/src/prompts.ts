import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'

export const localPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Your name is George-AI. You are a helpful travel assistant with access to the following magazine content:

    {context}

    Remove all control characters and provide the answer to the user's question as specifically as possible.
`,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

export const webPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Your name is George-AI. You are a travel assistant providing information for planning voyages.
    The search for information based on local PDF content was not successful.
    
    Remove all control characters and provide the answer to the user's question as specifically as possible.
    `,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])
