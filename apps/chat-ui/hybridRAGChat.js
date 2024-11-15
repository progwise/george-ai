import * as dotenv from 'dotenv'
dotenv.config()

import readline from 'readline'
import { ChatOpenAI } from '@langchain/openai'
import { ChatPromptTemplate } from '@langchain/core/prompts'
import { HumanMessage, AIMessage } from '@langchain/core/messages'
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'
import {
  RunnableMap,
  RunnablePassthrough,
  RunnableLambda,
  RunnableBranch,
} from '@langchain/core/runnables'

import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { z } from 'zod'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { formatDocumentsAsString } from 'langchain/util/document'

// Configuration and setup
const localDataFilePath = './data/mag_example1.pdf'
const CHUNK_SIZE = 200
const CHUNK_OVERLAP = 20
const LOCAL_RETRIEVAL_K = 10
const WEB_RETRIEVAL_K = 10

// Load and split documents
async function loadAndSplitDocuments(path) {
  const loader = new PDFLoader(path)
  const docs = await loader.load()
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  })
  return await splitter.splitDocuments(docs)
}

// Set up the local retriever with vector store
async function setupLocalRetriever(docs) {
  const embeddings = new OpenAIEmbeddings()
  const vectorStore = await MemoryVectorStore.fromDocuments(docs, embeddings)

  // Return retriever expecting only query strings
  return vectorStore.asRetriever({ k: LOCAL_RETRIEVAL_K })
}

// Define the prompt template
function createPromptTemplate() {
  return ChatPromptTemplate.fromMessages([
    [
      'system',
      `
      You are a helpful assistant.
      Use the following pieces of retrieved context to answer the question.
      If you don't know the answer, say that you don't know.
      Use three sentences maximum and keep the answer concise.
      State that you cannot answer if there were no data about the question in the context by returning null.
      
      This is the context:
      {context}
    `,
    ],
    ['human', '{input}'],
  ])
}

// Set up local and web retrievers, model, and prompt template
const splitDocs = await loadAndSplitDocuments(localDataFilePath)
const retrieverLocal = await setupLocalRetriever(splitDocs)
const retrieverWeb = new TavilySearchAPIRetriever({ k: WEB_RETRIEVAL_K })

const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.2,
})

const modelWithStructuredOutput = model.withStructuredOutput(
  z.object({ answer: z.string().nullable() }),
)

const promptTemplate = createPromptTemplate()
const promptChain = promptTemplate.pipe(modelWithStructuredOutput)

const formattedPairOfInputContext = new RunnableLambda({
  func: (input) => ({
    ...input,
    context: formatDocumentsAsString(input.docs),
  }),
})

const outputChain = new RunnableLambda({
  func: (input) => ({ answer: input.answerFromPrompt.answer }),
})

const mapLocal = RunnableMap.from({
  input: new RunnablePassthrough(),
  docs: retrieverLocal,
})

const mapWeb = RunnableMap.from({
  input: (input) => input.input,
  docs: (input) => retrieverWeb.invoke(input.input),
})

const webChain = mapWeb
  .pipe(formattedPairOfInputContext)
  .assign({ answerFromPrompt: promptChain })
  .pipe(outputChain)

const mainChain = mapLocal.pipe(formattedPairOfInputContext).pipe(
  RunnableMap.from({
    input: (input) => input.input,
    answerFromPrompt: promptChain,
  }).pipe(
    RunnableBranch.from([
      [
        (input) => {
          const noDataInPdfFound = !input.answerFromPrompt.answer
          if (noDataInPdfFound) {
            console.warn(
              'No relevant information found in the provided PDF. Switching to the web retriever for further search.',
            )
          }
          return noDataInPdfFound
        },
        webChain,
      ],
      outputChain,
    ]),
  ),
)

// Chat setup with readline
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

    try {
      // Forcefully convert input to a string before passing to mainChain
      const query = String(input)

      console.log('Debugging query input to mainChain:', query)

      const response = await mainChain.invoke({ input: query })

      console.log('Agent:', response.answer)

      chatHistory.push(new HumanMessage(query))
      chatHistory.push(
        new AIMessage(response.answer || "I'm sorry, I don't have an answer."),
      )
    } catch (error) {
      console.error('Error during processing:', error)
    }

    askQuestion()
  })
}
// Start the chat loop
console.log("Chat with the agent! Type 'exit' to end the conversation.")
askQuestion()
