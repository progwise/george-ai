import path from 'path'
import { MemoryVectorStore } from 'langchain/vectorstores/memory'
import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai"
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf'
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter'

import {
    RunnableSequence,
    RunnableBranch,
    RunnableLambda,
    RunnableWithMessageHistory,
} from '@langchain/core/runnables'

import { ChatMessageHistory } from 'langchain/stores/message/in_memory'
import { localPrompt, webPrompt } from './prompts'


const DATA_PATH = path.resolve(__dirname, '../data', 'mag_example1.pdf') // Path to the PDF document
const CHUNK_SIZE = 1000 // Increased for better context
const CHUNK_OVERLAP = 100
const LOCAL_RETRIEVAL_K = 4

// Create web search tool
const searchTool = {
    name: 'web_search',
    description: 'Web search tool',
    func: (query: string) => {
        console.log('Performing web search for:', query)
        return `Web search results for "${query}". Since the corresponding information was not found in the travel magazine, here's a detailed summary from web sources.`
    },
}

let pdfVectorStore: MemoryVectorStore | null;

const getPDFRetriever = async () => {
    if (pdfVectorStore) {
        return pdfVectorStore.asRetriever(LOCAL_RETRIEVAL_K)
    }
    // Load and process documents
    console.log('Loading PDF document...')
    const loader = new PDFLoader(DATA_PATH)
    const rawDocs = await loader.load()
    console.log(`Loaded ${rawDocs.length} pages from PDF`)
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: CHUNK_SIZE,
        chunkOverlap: CHUNK_OVERLAP,
    })
    const splitDocs = await splitter.splitDocuments(rawDocs)
    console.log(`Split into ${splitDocs.length} chunks`)
    const embeddings = new OpenAIEmbeddings()
    pdfVectorStore = await MemoryVectorStore.fromDocuments(
        splitDocs,
        embeddings,
    )
    return pdfVectorStore.asRetriever(LOCAL_RETRIEVAL_K)
}


// Retriever functions
const retrieveLocalContent = async (question: string) => {
    try {

        // Load retriever
        const retrieverLocal = await getPDFRetriever()
        console.log('Searching PDF for:', question)
        const docs = await retrieverLocal.invoke(question)
        const content = docs.map((doc) => doc.pageContent).join('\n\n')
        // console.log('Found PDF content:', content.length > 0)
        return content
    } catch (error) {
        console.error('Error retrieving PDF content:', error)
        return ''
    }
}
const retrieveWebContent = async (question: string) => {
    try {
        console.log('Retrieving web information for:', question)
        return await searchTool.func(question)
    } catch (error) {
        console.error('Error retrieving web content:', error)
        return `Unable to retrieve specific web information about ${question}`
    }
}

const model = new ChatOpenAI({ modelName: 'gpt-4', temperature: 0.7 })


// Create the processing chains
const localChain = RunnableSequence.from([
    localPrompt,
    model,
    (output) => `[Magazine Source] ${output.content}`,
])
const webChain = RunnableSequence.from([
    async (input) => ({
        ...input,
        webResults: await retrieveWebContent(input.question),
    }),
    webPrompt,
    model,
    (output) => `[Web Source] ${output.content}`,
])

const localOrWebChain = new RunnableLambda({
    func: async (input: any, options: any) => {
        const localResponse = await localChain.invoke(input, options)
        if (localResponse.includes('NOT_FOUND')) {
            console.log('Magazine content insufficient, switching to web...')
            const webResponse = await webChain.invoke(input, options)
            return webResponse
        } else {
            return localResponse
        }
    },
})

const mainChain = RunnableSequence.from([
    async (input) => ({
        ...input,
        context: await retrieveLocalContent(input.question),
    }),
    RunnableBranch.from([
        [
            (input) => !!(input.context && input.context.trim().length > 0),
            localOrWebChain,
        ],
        webChain,
    ]),
])

// Message history management using RunnableWithMessageHistory
const messageHistories = new Map()
export const chainWithHistory = new RunnableWithMessageHistory({
    runnable: mainChain,
    getMessageHistory: (sessionId) => {
        if (!messageHistories.has(sessionId)) {
            messageHistories.set(sessionId, new ChatMessageHistory())
        }
        return messageHistories.get(sessionId)
    },
    inputMessagesKey: 'question',
    historyMessagesKey: 'chat_history',
})
