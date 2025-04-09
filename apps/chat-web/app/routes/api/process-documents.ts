import { json } from '@tanstack/react-start'
import { createAPIFileRoute } from '@tanstack/react-start/api'

export const APIRoute = createAPIFileRoute('/api/process-documents')({
  GET: ({ request, params }) => {
    console.log('GET /api/process-documents', { request, params })
    return json({ message: 'Hello "/api/process-documents" is not implemented!' })
  },
})
