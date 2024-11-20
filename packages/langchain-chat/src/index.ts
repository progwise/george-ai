import * as mainChain from './mainChain'
export const ask = (params: {question: string, sessionId: string} ) => mainChain.chainWithHistory.invoke({question: params.question}, { configurable: { sessionId: params.sessionId}})
