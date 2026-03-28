import { logger } from '../common'
import {
  AsyncAction,
  AsyncActionSchema,
  SyncAction,
  SyncActionSchema,
  SyncRequest,
  WORKSPACE_VERBS,
  WorkspaceRequest,
  WorkspaceResponse,
  WorkspaceStatus,
  WorkspaceVerb,
  WorkspaceVerbSchema,
} from './schema'

export function getStreamSubjects() {
  return WORKSPACE_VERBS.map((verb) => `george.ws.*.${verb}.>`)
}

export function getSyncSubject(request: SyncRequest) {
  return `george.ws.${request.workspaceId}.invoke.${request.action}`
}

export function getSyncSubjectFilter(args: { workspaceId?: string; action?: SyncAction }) {
  return `george.ws.${args.workspaceId ? args.workspaceId : '*'}.invoke.${args.action ? args.action : '*'}`
}

export function getAsyncSubject(event: WorkspaceRequest | WorkspaceStatus | WorkspaceResponse) {
  return `george.ws.${event.workspaceId}.${event.verb}.${event.action}`
}

export function getAsyncSubjectFilters(args: { workspaceId?: string; verb?: WorkspaceVerb; action?: AsyncAction }) {
  return [`george.ws.${args.workspaceId ?? '*'}.${args.verb ?? '*'}.${args.action ?? '*'}`]
}

export function getConsumerSubjectFilters(args: { workspaceId: string; action: AsyncAction }) {
  return [`george.ws.${args.workspaceId}.*.${args.action}`, `george.ws.${args.workspaceId}.*.${args.action}.>`]
}

export function parseSyncSubject(subject: string) {
  const tokens = subject.split('.')

  if (tokens[0] !== 'george' || tokens[1] !== 'ws' || tokens.length < 5) {
    logger.warn('Sync subject could not be parsed', { subject, tokens })
    return null
  }

  return {
    workspaceId: tokens[2],
    action: SyncActionSchema.parse(tokens[4]),
    remaining: tokens.slice(5),
  }
}

export function parseAsyncSubject(subject: string) {
  const tokens = subject.split('.')

  if (tokens[0] !== 'george' || tokens[1] !== 'ws' || tokens.length < 5) {
    logger.warn('Async subject could not be parsed', { subject, tokens })
    return null
  }

  return {
    workspaceId: tokens[2],
    verb: WorkspaceVerbSchema.parse(tokens[3]),
    action: AsyncActionSchema.parse(tokens[4]),
    remaining: tokens.slice(5),
  }
}
