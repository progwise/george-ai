import * as dotenv from 'dotenv'
dotenv.config()

import readline from 'readline'
import { ChatOpenAI } from '@langchain/openai'
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { createOpenAIFunctionsAgent, AgentExecutor } from 'langchain/agents'
import { createRetrieverTool } from 'langchain/tools/retriever'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { OpenAIEmbeddings } from '@langchain/openai'
import { fileURLToPath } from 'url'
import path from 'path'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const pdf_file = path.resolve(__dirname, './data/mag_example1.pdf')

const loader = new PDFLoader(pdf_file)
const docs = await loader.load()

// Split the PDF content
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 200,
})
const splitDocs = await splitter.splitDocuments(docs)

// Create a Vector Store
const embeddings = new OpenAIEmbeddings()
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)

// Local retriever for PDF data
const retrieverLocal = vectorStore.asRetriever({ k: 2 })

const retrieverWeb = new TavilySearchAPIRetriever({ k: 3 })
const retrieverWebTool = createRetrieverTool(retrieverWeb, {
  name: 'web_search',
  description: 'Searches for additional information on the web.',
})

// Instantiate the model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.2,
})

// Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant with memory.'],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
])

// Tools for retrieval
const retrieverLocalTool = createRetrieverTool(retrieverLocal, {
  name: 'pdf_search',
  description: 'Retrieves information from the loaded PDF document.',
})
const tools = [retrieverLocalTool, retrieverWebTool]

// Create the agent and executor
const agent = await createOpenAIFunctionsAgent({
  llm: model,
  prompt,
  tools,
})

const agentExecutor = new AgentExecutor({
  agent,
  tools,
})

// User Interaction via Command Line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const chatHistory = []

function askQuestion() {
  rl.question('User: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close()
      return
    }

    // Attempt to retrieve from PDF
    const response = await agentExecutor.invoke({
      input,
      chat_history: chatHistory,
    })

    console.log(`response output:`, response.output)
    // Check if local PDF retrieval had an answer
    let outputText =
      response.output || "I couldn't find relevant information in the PDF."

    if (!response.output) {
      const webResponse = await agentExecutor.invoke({
        input,
        chat_history: chatHistory,
        tool_names: ['web_search'],
      })
      outputText = webResponse.output
        ? `PDF lacked the answer, but here's what I found on the web: ${webResponse.output}`
        : "I couldn't find relevant information in either the PDF or the web."
    }

    console.log('Agent: ', outputText)

    // Update chat history
    chatHistory.push(new HumanMessage(input))
    chatHistory.push(new AIMessage(outputText))

    askQuestion()
  })
}

askQuestion()
