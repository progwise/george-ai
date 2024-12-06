import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'
import { processUnprocessedDocuments } from '@george-ai/langchain-chat'

export const Route = createAPIFileRoute('/api/process-documents')({
  GET: async ({ request, params }) => {
    console.log('GET /api/process-documents', { request, params })
    await processUnprocessedDocuments()
    return json({ message: 'Hello "/api/process-documents"!' })
  },
})
