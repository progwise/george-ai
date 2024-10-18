import * as dotenv from 'dotenv'
dotenv.config()

import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import {formatDocumentsAsString} from 'langchain/util/document'
import { AIMessage, HumanMessage } from '@langchain/core/messages'
import {RunnableMap, RunnablePassthrough} from '@langchain/core/runnables'
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents'

// Tool imports
import { TavilySearchResults } from '@langchain/community/tools/tavily_search'
import { createRetrieverTool } from 'langchain/tools/retriever'

// Custom Data Source, Vector Stores
import { OpenAIEmbeddings } from '@langchain/openai'
import { CheerioWebBaseLoader } from 'langchain/document_loaders/web/cheerio'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { createStuffDocumentsChain } from "langchain/chains/combine_documents";

import { StringOutputParser } from "@langchain/core/output_parsers";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

const mag_example1 = "./data/mag_example1.pdf";

const loader = new PDFLoader(mag_example1);

const docs = await loader.load()
// console.log(docs[0])

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 200,
  chunkOverlap: 20,
})

const splitDocs = await splitter.splitDocuments(docs)

const embeddings = new OpenAIEmbeddings()

const vectorStore = await MemoryVectorStore.fromDocuments(splitDocs, embeddings)

const retriever = vectorStore.asRetriever({
  k: 10,
})

// Instantiate the model
const model = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo-1106',
  temperature: 0.2,
})

// Prompt Template
const prompt = ChatPromptTemplate.fromMessages([
  ('system', `You are a helpful assistant.
    Use the following pieces of retrieved context to answer 
    the question. If you don't know the answer, say that you 
    don't know. Use three sentences maximum and keep the
    answer concise.

    State that you can not answer if there was no data about the question in the context.

    This is the context:

    {context}
    `),
  //new MessagesPlaceholder('chat_history'),
  ('human', '{input}'),
  //new MessagesPlaceholder('agent_scratchpad'),
])

const chain1 = prompt.pipe(model)

const map1 = RunnableMap.from({
  input: new RunnablePassthrough(),
  docs: retriever
})

const chain2 = map1.assign({context: input => formatDocumentsAsString(input.docs)}).assign({answer: chain1}).pick(['answer'])

const response = await chain2.invoke('Ist Empuriabrava ein lohnendes Reiseziel?')
//const response = await chain2.invoke('Was muss ich im Verzasca Tal unbedingt ansehen?')
//const response = await chain2.invoke('Was muss ich mir in Graz unbedingt ansehen?')
console.log(response)
