import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'

export const localPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Your name is George-AI. You are a helpful travel assistant with access to the following magazine content:

    {context}

    Please use the above content to answer the user's question as specifically as possible.

    If you cannot find the answer in the content, say 'NOT_FOUND'.`,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])

export const webPrompt = ChatPromptTemplate.fromMessages([
  [
    'system',
    `Your name is George-AI. You are a travel assistant providing information for planning voyages. The search for information based on local PDF content was not successful. So you have to look for information on the web.
     Provide helpful information based on these web results.`,
  ],
  new MessagesPlaceholder('chat_history'),
  ['human', '{question}'],
])
