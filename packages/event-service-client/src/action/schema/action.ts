import z from 'zod'

import { ENRICHMENT_ACTIONS, INFERENCE_ACTIONS, INFERENCE_HOST_ACTIONS, LIBRARY_ACTIONS } from '@george-ai/app-schema'

export const SYNC_ACTIONS = [...INFERENCE_ACTIONS, ...INFERENCE_HOST_ACTIONS] as const
export type SyncAction = (typeof SYNC_ACTIONS)[number]
export const SyncActionSchema = z.enum(SYNC_ACTIONS)

export const ASYNC_ACTIONS = [...LIBRARY_ACTIONS, ...ENRICHMENT_ACTIONS] as const
export type AsyncAction = (typeof ASYNC_ACTIONS)[number]
export const AsyncActionSchema = z.enum(ASYNC_ACTIONS)

export const ANY_ACTIONS = [...SYNC_ACTIONS, ...ASYNC_ACTIONS] as const
export type AnyAction = (typeof ANY_ACTIONS)[number]
export const AnyActionSchema = z.enum(ANY_ACTIONS)
