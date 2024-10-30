import * as dotenv from 'dotenv'
dotenv.config()

import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { formatDocumentsAsString } from 'langchain/util/document'
import { RunnableMap, RunnablePassthrough } from '@langchain/core/runnables'

// Custom Data Source, Vector Stores
import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { z } from 'zod'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'

const mag_example1 = './data/mag_example1.pdf'

// Step 1: Load the PDF file
const loader = new PDFLoader(mag_example1)
const docs = await loader.load()

// Step 2: Split the loaded documents into smaller chunks
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
})
const splitDocs = await splitter.splitDocuments(docs)

// Step 3: Convert document chunks into embeddings for similarity search
const embeddings = new OpenAIEmbeddings()
const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)

// Step 4: Set up the local retriever from vector store
const retrieverLocal = vectorStore.asRetriever({
  k: 10, // retrieve up to 10 most similar chunks
})

// Step 5: Set up the web retriever (fallback) with a search API
const retrieverWeb = new TavilySearchAPIRetriever({
  k: 6, // retrieve up to 6 relevant web articles
})

// Step 6: Instantiate the model (GPT-4, for example)
const model = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.2,
})

// Step 7: Define structured output for clarity and error handling
const modelWithStructuredOutput = model.withStructuredOutput(
  z.object({
    answer: z.string().nullable(),
  }),
)

// Step 8: Create the prompt for local retrieval-based responses
const promptLocal = ChatPromptTemplate.fromMessages([
  ('system',
  `You are a helpful assistant.
    Use the following pieces of retrieved context to answer 
    the question. If you don't know the answer, say that you 
    don't know. Use three sentences maximum and keep the
    answer concise.

    State that you cannot answer if there were no data about the question in the context by returning null.

    This is the context:

    {context}
    `),
  ('human', '{input}'),
])

const chain1 = promptLocal.pipe(modelWithStructuredOutput)

// Step 9: Map input data and execute the local retriever
const map1 = RunnableMap.from({
  input: new RunnablePassthrough(),
  docs: retrieverLocal,
  Array,
})

// Step 10: Check local answer; if not found, execute the web retriever chain
const chain2 = map1
  .assign({ context: (input) => formatDocumentsAsString(input.docs) })
  .assign({ answer: chain1 })
  .assign(async ({ answer, input }) => {
    if (answer.answer) {
      // If an answer was found in the PDF, return it
      return { answer: answer.answer }
    } else {
      // Otherwise, perform a web search for a response
      const webDocs = await retrieverWeb.getRelevantDocuments(input)
      const webContext = formatDocumentsAsString(webDocs)

      const promptWeb = ChatPromptTemplate.fromMessages([
        ('system',
        `You are a helpful assistant. I couldn't find relevant information in the provided PDF. I have retrieved some web-based context to help answer the question. 
        Answer concisely in three sentences or less.

        This is the web-based context:
        {webContext}
        `),
        ('human', '{input}'),
      ])

      // Run model with web context prompt if local PDF retrieval failed
      const webAnswer = await promptWeb
        .pipe(modelWithStructuredOutput)
        .invoke({ input, webContext })

      return {
        answer: webAnswer.answer
          ? `I could not find relevant information in the provided PDF file. Here's what I found online: ${webAnswer.answer}`
          : 'I could not find relevant information in the provided PDF or from online sources.',
      }
    }
  })
  .pick(['answer'])

// Invoke the chain with a sample question
const response = await chain2.invoke('Ist Greifswald ein lohnendes Reiseziel?')
console.log(response)
