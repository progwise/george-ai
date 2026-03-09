import z from 'zod'

import { ENRICHMENT_ACTIONS } from './enrichment'
import { LIBRARY_ACTIONS } from './library'

export const EVENT_QUEUE_STATUS = ['running', 'paused', 'unknown'] as const
export type EventQueueStatus = (typeof EVENT_QUEUE_STATUS)[number]
export const EventQueueStatusSchema = z.enum(EVENT_QUEUE_STATUS)

export const EVENT_QUEUE_ACTIONS = [...LIBRARY_ACTIONS, ...ENRICHMENT_ACTIONS] as const
export type EventQueueAction = (typeof EVENT_QUEUE_ACTIONS)[number]
export const EventQueueActionSchema = z.enum(EVENT_QUEUE_ACTIONS)

export const EventQueueSchema = z.object({
  action: EventQueueActionSchema,
  status: EventQueueStatusSchema,
  error: z.string().optional(),
  pending: z.number().optional(),
  delivered: z.number().optional(),
  redelivered: z.number().optional(),
  waiting: z.number().optional(),
})

export type EventQueue = z.infer<typeof EventQueueSchema>
