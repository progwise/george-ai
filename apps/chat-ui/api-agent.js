import * as dotenv from 'dotenv'
dotenv.config()

import { ChatPromptTemplate } from '@langchain/core/prompts'
import { ChatOpenAI } from '@langchain/openai'
import { formatDocumentsAsString } from 'langchain/util/document'
import { TavilySearchAPIRetriever } from '@langchain/community/retrievers/tavily_search_api'
import {
  RunnableMap,
  RunnablePassthrough,
  RunnableLambda,
  RunnableBranch,
} from '@langchain/core/runnables'

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
const prompt = ChatPromptTemplate.fromMessages([
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

const promptChain = prompt.pipe(modelWithStructuredOutput)

const map1 = RunnableMap.from({
  input: new RunnablePassthrough(),
  docs: retrieverLocal,
  // Array,
})

const map2 = RunnableMap.from({
  input: (input) => input.input,
  docs: (input) => retrieverWeb.invoke(input.input),
  // Array,
})

// const webChain = map2
//   .assign({
//     context: (input) => {
//       // console.log('web', input)
//       return formatDocumentsAsString(input.docs)
//     },
//   })
// .assign({
//   temp: (input) => {
//     console.log('assign', input)
//     return 'temp'
//   },
// })
// .assign({ answer: promptChain })
// .assign({
//   context: (data) => {
//     console.log('result of promptchain', data)
//     return data
//   },
// })
// .pick(['answer'])

// const chain2 = map1
//   .assign({
//     context: (map1) => {
//       return formatDocumentsAsString(map1.docs)
//     },
//   })
//   .assign({ answer: promptChain })
//   .assign({
//     context: ({ input, docs, context, answer }) => {
//       //console.log('huhu', Object.keys(data))
//       // return data
//       console.log('local answer', answer.answer)
//       if (answer.answer) {
//         return { input, docs, context, answer }
//       } //Create WebChain and use
//       console.log('asking webChain', { input })
//       // return webChain.invoke(input) //Add the formatDocumentsAsString and the prompt
//       return webChain.invoke(input) //Add the formatDocumentsAsString and the prompt
//     },
//   })
//Add another assign that takes Web retriever

// .assign(({ answer }) => {
//   console.log(`Hi`, answer)
//   if (answer.answer) {
//     return { answer: answer.answer }
//   } //Create WebChain and use
//   return webChain //Add the formatDocumentsAsString and the prompt
//   // ;({ input: new RunnablePassthrough(), docs: retrieverLocal })
// })
// .assign({
//   context: (data) => {
//     console.log('after', Object.keys(data.context))
//     return data.context
//   },
// })
// .pick(['answer'])

const formatDocs = new RunnableLambda({
  func: (input) => {
    return {
      ...input,
      context: formatDocumentsAsString(input.docs),
    }
  },
})

const outputChain = new RunnableLambda({
  func: (input) => {
    return {
      answer: input.answerFromPrompt.answer,
    }
  },
})

// const debuggerChain = (tag) =>
//   new RunnableLambda({
//     func: (input) => {
//       console.log('debug', tag, input)
//       return input
//     },
//   })

const webChain2 = map2
  // .pipe(debuggerChain('after retrieve'))
  .pipe(formatDocs)
  // .pipe(debuggerChain('after formatting'))
  .assign({ answerFromPrompt: promptChain })
  // .pipe(debuggerChain('after prompt'))
  .pipe(outputChain)

const chain3 = map1.pipe(formatDocs).pipe(
  RunnableMap.from({
    input: (input) => input.input,
    answerFromPrompt: promptChain,
  }).pipe(
    RunnableBranch.from([
      [
        (input) => {
          const noDataInPdfFound = !input.answerFromPrompt.answer

          if (noDataInPdfFound) {
            console.log("Couldn't find any information in pdf, use web instead")
          }

          return noDataInPdfFound
        },
        webChain2,
      ],
      outputChain,
    ]),
  ),
)
// console.log(await chain3.invoke('Ist Greifswald ein lohnendes Reiseziel?'))
console.log(
  await chain3.invoke('Was muss ich in Greifswald unbedingt ansehen?'),
  // await chain3.invoke('Was muss ich im Verzasca Tal unbedingt ansehen?'),
)

// const response = await chain2.invoke(
//   //'Ist Empuriabrava ein lohnendes Reiseziel?',
//   'Ist Greifswald ein lohnendes Reiseziel?',
// )
//const response = await chain2.invoke('Was muss ich im Verzasca Tal unbedingt ansehen?')
// //const response = await chain2.invoke('Was muss ich mir in Graz unbedingt ansehen?')
// console.log(`MY:`, response)
