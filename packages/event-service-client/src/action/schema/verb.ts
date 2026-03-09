import z from 'zod'

// Invoke is a request that only uses non-streaming subjects. Invoke is never used inside a event schema,
// Inside the event envelop it is only called "request"
export const WORKSPACE_VERBS = ['request', 'status', 'response'] as const
export type WorkspaceVerb = (typeof WORKSPACE_VERBS)[number]
export const WorkspaceVerbSchema = z.enum(WORKSPACE_VERBS)
