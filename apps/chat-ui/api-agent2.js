import * as dotenv from 'dotenv'
dotenv.config()

import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { formatDocumentsAsString } from 'langchain/util/document'
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'
import { RunnableMap, RunnablePassthrough } from '@langchain/core/runnables'

// Custom Data Source, Vector Stores
import { OpenAIEmbeddings } from '@langchain/openai'

import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'

import { z } from 'zod'
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'

const mag_example1 = './data/mag_example1.pdf'

const loader = new PDFLoader(mag_example1)

const docs = await loader.load()
// console.log(docs[0])

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
})

const splitDocs = await splitter.splitDocuments(docs)

const embeddings = new OpenAIEmbeddings()

const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)

const retrieverLocal = vectorStore.asRetriever({
  k: 10,
})

const retrieverWeb = new TavilySearchAPIRetriever({
  k: 6, // Number of articles to retrieve
})

// Instantiate the model
const model = new ChatOpenAI({
  modelName: 'gpt-4o',
  temperature: 0.2,
})

// Tool calling setup with structured output
const modelWithStructuredOutput = model.withStructuredOutput(
  z.object({
    answer: z.string().nullable(),
  }),
)

// Prompt Template
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
  //new MessagesPlaceholder('chat_history'),
  ('human', '{input}'),
  //new MessagesPlaceholder('agent_scratchpad'),
])

const promptChain = promptLocal.pipe(modelWithStructuredOutput)

const map1 = RunnableMap.from({
  input: new RunnablePassthrough(),
  docs: retrieverLocal,
  // Array,
})

const map2 = RunnableMap.from({
  input: new RunnablePassthrough(),
  docs: retrieverWeb,
  // Array,
})

const webChain = map2
  .assign({ context: (input) => formatDocumentsAsString(input.docs) })
  .assign({ answer: promptChain })

const chain2 = map1
  .assign({ context: (input) => formatDocumentsAsString(input.docs) })
  .assign({ answer: promptChain })
  //Add another assign that takes Web retriever

  .assign(({ answer }) => {
    if (answer.answer) {
      return { answer: answer.answer }
    } //Create WebChain and use
    return webChain //Add the formatDocumentsAsString and the prompt
    // ;({ input: new RunnablePassthrough(), docs: retrieverLocal })
  })
  .pick(['answer'])

const response = await chain2.invoke(
  // 'Ist Empuriabrava ein lohnendes Reiseziel?',
  'Ist Greifswald ein lohnendes Reiseziel?',
)
//const response = await chain2.invoke('Was muss ich im Verzasca Tal unbedingt ansehen?')
//const response = await chain2.invoke('Was muss ich mir in Graz unbedingt ansehen?')
console.log(response)
