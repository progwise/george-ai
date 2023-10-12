/* eslint-disable unicorn/prevent-abbreviations */
import { RetrievalQAChain } from 'langchain/chains'
import { OpenAIEmbeddings } from 'langchain/embeddings/openai'
import { HNSWLib } from 'langchain/vectorstores/hnswlib'
import { TextLoader } from 'langchain/document_loaders/fs/text'
import { CharacterTextSplitter } from 'langchain/text_splitter'
import { ChainTool } from 'langchain/tools'
import url from 'node:url'
import path from 'node:path'
import { ChatOpenAI } from 'langchain/chat_models/openai'
import { BaseLanguageModel } from 'langchain/base_language'
import dotenv from 'dotenv'
dotenv.config()

const __dirname = url.fileURLToPath(new URL('.', import.meta.url))

const retrievalLlm = new ChatOpenAI({ temperature: 0 })
const embeddings = new OpenAIEmbeddings()

export async function loadSalesDocVectorStore(FileName: string) {
  // your knowledge path
  const fullpath = path.resolve(__dirname, `./knowledge/${FileName}`)
  const loader = new TextLoader(fullpath)
  const docs = await loader.load()
  const splitter = new CharacterTextSplitter({
    chunkSize: 10,
    chunkOverlap: 0,
  })
  const new_docs = await splitter.splitDocuments(docs)
  return HNSWLib.fromDocuments(new_docs, embeddings)
}

export async function setup_knowledge_base(
  FileName: string,
  llm: BaseLanguageModel,
) {
  const vectorStore = await loadSalesDocVectorStore(FileName)
  const knowledge_base = RetrievalQAChain.fromLLM(
    retrievalLlm,
    vectorStore.asRetriever(),
  )
  return knowledge_base
}

/*
 * query to get_tools can be used to be embedded and relevant tools found
 * we only use one tool for now, but this is highly extensible!
 */

export async function get_tools(product_catalog: string) {
  const chain = await setup_knowledge_base(product_catalog, retrievalLlm)
  const tools = [
    new ChainTool({
      name: 'ProductSearch',
      description:
        'useful for when you need to answer questions about product information',
      chain,
    }),
  ]
  return tools
}
