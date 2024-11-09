import * as dotenv from 'dotenv'
dotenv.config()

import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { formatDocumentsAsString } from 'langchain/util/document'
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'
import { RunnableBranch, RunnableSequence } from '@langchain/core/runnables'

import { OpenAIEmbeddings } from '@langchain/openai'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

import { z } from 'zod'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'

const mag_example1 = './data/mag_example1.pdf'

;(async () => {
  const loader = new PDFLoader(mag_example1)
  const docs = await loader.load()

  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 200,
    chunkOverlap: 20,
  })
  const splitDocs = await splitter.splitDocuments(docs)

  const embeddings = new OpenAIEmbeddings()
  const vectorStore = await MemoryVectorStore.fromDocuments(
    splitDocs,
    embeddings,
  )

  const retrieverLocal = vectorStore.asRetriever({ k: 10 })
  const retrieverWeb = new TavilySearchAPIRetriever({ k: 6 })

  const model = new ChatOpenAI({
    modelName: 'gpt-4',
    temperature: 0.2,
  })

  const modelWithStructuredOutput = model.withStructuredOutput(
    z.object({
      answer: z.string().nullable(),
    }),
  )

  const promptTemplate = ChatPromptTemplate.fromMessages([
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

  const promptChain = promptTemplate.pipe(modelWithStructuredOutput)

  // Define the branches for the retrievers
  const branch = RunnableBranch.from([
    [
      async (input) => {
        const localResult = await retrieverLocal.retrieve(input.question)
        return localResult && localResult.length > 0
      },
      async (input) => {
        const localResult = await retrieverLocal.retrieve(input.question)
        return promptChain.invoke({
          context: formatDocumentsAsString(localResult),
          input: input.question,
        })
      },
    ],
    [
      async () => true, // Default branch to web retriever if local retrieval fails
      async (input) => {
        console.log('Local retriever returned null. Using web retriever...')
        const webResult = await retrieverWeb.retrieve(input.question)
        return promptChain.invoke({
          context: formatDocumentsAsString(webResult),
          input: input.question,
        })
      },
    ],
  ])

  const sequenceChain = RunnableSequence.from([
    {
      question: (input) => input.question,
    },
    branch,
  ])

  const result = await sequenceChain.invoke({
    question: 'How do I use LangChain?',
  })

  console.log(result)
})()
