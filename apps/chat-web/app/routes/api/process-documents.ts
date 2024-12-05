import { json } from '@tanstack/start'
import { createAPIFileRoute } from '@tanstack/start/api'

export const Route = createAPIFileRoute('/api/process-documents')({
  GET: ({ request, params }) => {
    console.log('GET /api/process-documents', { request, params })
    return json({ message: 'Hello "/api/process-documents"!' })
  },
})
