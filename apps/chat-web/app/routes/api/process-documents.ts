import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { processUnprocessedDocuments } from '@george-ai/langchain-chat'

export const APIRoute = createAPIFileRoute('/api/process-documents')({
  GET: ({ request, params }) => {
    console.log('GET /api/process-documents', { request, params })
    setTimeout(() => processUnprocessedDocuments(), 2000)
    return json({ message: 'Hello "/api/process-documents"!' })
  },
})
