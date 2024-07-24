import * as dotenv from 'dotenv'
dotenv.config()

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'

import { AIMessage, HumanMessage } from '@langchain/core/messages'

import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'

// Tool imports
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { createRetrieverTool } from 'langchain/tools/retriever'

// Custom Data Source, Vector Stores
import { OpenAIEmbeddings } from '@langchain/openai'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

//
// i) Add new tool to make the george ai typesense search on the scraped pages
// ii) keep the current tavilySearch and CheerioWebBaseLoader tools
// iii) understand how tools are selected and queried? When does the chatbot agent use which tool?
// iv) build a configuration route to add and activate configurations for the chatbot

const chatbotConfiguration = {
  name: 'config 1',
  systemPrompt:
    'Du hilfst Angestellten bei der Suche von Information aus dem Intranet.', // more than 1 prompt??
  tools: [
    {
      type: 'cheerioWebLoader',
      urls: ['https://www.progwise.net/', 'https://prof.um.ac.ir/akbazar/'],
    },
    {
      type: 'tavilySearchTool',
    },
    {
      type: 'georgeAiTypesenseSearchTool',
      // ??
    },
  ],
}

// v) how to build a UI to store several configurations to some DB  and activate one of them ? localhost:5173/configuration
// vi) clear button for the chat history
// vii) do not use send button, just send on Return key
// viii) do it in typescript

// Create Retriever
const urls = ['https://www.progwise.net/', 'https://prof.um.ac.ir/akbazar/']

const loader = new CheerioWebBaseLoader(urls)
const docs = await loader.load()

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
})

const splitDocs = await splitter.splitDocuments(docs)

const embeddings = new OpenAIEmbeddings()

const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)

const retriever = vectorStore.asRetriever({
  k: 2,
})

// Instantiate the model
const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-1106',
  temperature: 0.2,
})

// Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
  ('system', 'You are a helpful assistant.'),
  new MessagesPlaceholder('chat_history'),
  ('human', '{input}'),
  new MessagesPlaceholder('agent_scratchpad'),
])

// Tools
const searchTool = new TavilySearchResults()
const retrieverTool = createRetrieverTool(retriever, {
  name: 'lcel_search',
  description:
    'Use this tool when searching for information about provided URLs.',
})

const tools = [searchTool, retrieverTool]

const agent = await createOpenAIFunctionsAgent({
  llm: model,
  prompt,
  tools,
})

// Create the executor
const agentExecutor = new AgentExecutor({
  agent,
  tools,
})

const chat_history = []

export async function handleUserInput(input) {
  // agent.
  const response = await agentExecutor.invoke({
    input: input,
    chat_history: chat_history,
  })

  chat_history.push(new HumanMessage(input))
  chat_history.push(new AIMessage(response.output))

  return response.output
}
