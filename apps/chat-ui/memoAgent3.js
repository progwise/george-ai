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

// Step 1: Split the PDF content and extract intro for welcome message
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 2000,
  chunkOverlap: 200,
})
const splitDocs = await splitter.splitDocuments(docs)
const introText = splitDocs[0].pageContent // Take the first chunk as the introduction

// Step 2: Create a Vector Store for PDF-based retrieval
const embeddings = new OpenAIEmbeddings()
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)
const retrieverLocal = vectorStore.asRetriever({ k: 2 })

// Set up web-based retriever for fallback
const retrieverWeb = new TavilySearchAPIRetriever({ k: 3 })

// Step 3: Instantiate the model
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.2,
})

// Step 4: Generate a Welcome Message based on PDF Intro Content
const welcomePromptTemplate = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant that creates friendly greetings.'],
  [
    'user',
    `Based on this content, create a warm, welcoming message for the user: "${introText}"`,
  ],
])
const welcomeResponse = await welcomePromptTemplate
  .pipe(model)
  .invoke({ input: '' })
const welcomeMessage =
  welcomeResponse.output ||
  "Hello! I'm here to assist you with any questions related to the document."

// Step 5: Prompt Template for regular questions
const prompt = ChatPromptTemplate.fromMessages([
  ['system', 'You are a helpful assistant with memory.'],
  new MessagesPlaceholder('chat_history'),
  ['human', '{input}'],
  new MessagesPlaceholder('agent_scratchpad'),
])

// Define tools for retrieval, local first then web as fallback
const retrieverLocalTool = createRetrieverTool(retrieverLocal, {
  name: 'pdf_search',
  description: 'Retrieves information from the loaded PDF document.',
})
const retrieverWebTool = createRetrieverTool(retrieverWeb, {
  name: 'web_search',
  description: 'Searches for additional information on the web.',
})
const tools = [retrieverLocalTool, retrieverWebTool]

// Step 6: Create the agent and executor
const agent = await createOpenAIFunctionsAgent({
  llm: model,
  prompt,
  tools,
})
const agentExecutor = new AgentExecutor({
  agent,
  tools,
})

// Step 7: User Interaction via Command Line
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

const chatHistory = []

// Display welcome message to the user
console.log('Agent: ', welcomeMessage)
console.log(
  'Agent: Feel free to ask me any questions about the content in this document.',
)

// Main Q&A function
async function askQuestion() {
  rl.question('User: ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close()
      return
    }

    // First, try retrieving from PDF
    const response = await agentExecutor.invoke({
      input,
      chat_history: chatHistory,
      tool_names: ['pdf_search'], // Only use PDF search initially
    })

    // Check if PDF-based retrieval failed to provide an answer
    let outputText
    if (response.output) {
      outputText = response.output
    } else {
      // Fall back to web retrieval if PDF search didn't have an answer
      console.log(
        'No relevant information found in the PDF. Trying web search...',
      )

      const webResponse = await agentExecutor.invoke({
        input,
        chat_history: chatHistory,
        tool_names: ['web_search'], // Use only the web search here
      })

      outputText = webResponse.output
        ? `I couldn't find relevant information in the PDF, but here's an answer based on web sources: ${webResponse.output}`
        : 'No relevant information was found in either the PDF or web sources.'
    }

    console.log('Agent: ', outputText)

    // Update chat history
    chatHistory.push(new HumanMessage(input))
    chatHistory.push(new AIMessage(outputText))

    askQuestion()
  })
}

askQuestion()
