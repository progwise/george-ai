import { queryVectorStore } from '@george-ai/langchain-chat'

import { builder } from '../builder'
import { canAccessLibraryOrThrow } from './check-participation'

const AiLibraryQueryHitHighlight = builder
  .objectRef<{ field: string; snippet?: string }>('AiLibraryQueryHitHighlight')
  .implement({
    fields: (t) => ({
      field: t.exposeString('field', { nullable: false }),
      snippet: t.exposeString('snippet', { nullable: true }),
    }),
  })
const AiLibraryQueryHit = builder
  .objectRef<{
    pageContent: string
    docName: string
    docId: string
    id: string
    docPath: string
    originUri: string
    highlights: Array<{ field: string; snippet?: string }>
  }>('AiLibraryQueryHit')
  .implement({
    fields: (t) => ({
      id: t.exposeString('id', { nullable: false }),
      docId: t.exposeString('docId', { nullable: false }),
      docName: t.exposeString('docName', { nullable: false }),
      pageContent: t.exposeString('pageContent', { nullable: false }),
      docPath: t.exposeString('docPath', { nullable: false }),
      originUri: t.exposeString('originUri', { nullable: false }),
      highlights: t.field({
        type: [AiLibraryQueryHitHighlight],
        nullable: false,
        resolve: (parent) => parent.highlights || [],
      }),
    }),
  })

const AiLibraryQueryResult = builder
  .objectRef<{
    libraryId: string
    query: string
    take: number
    skip: number
    hitCount: number
    hits: Array<{
      pageContent: string
      docName: string
      docId: string
      id: string
      docPath: string
      originUri: string
      highlights: Array<{ field: string; snippet?: string }>
    }>
  }>('AiLibraryQueryResult')
  .implement({
    fields: (t) => ({
      libraryId: t.exposeString('libraryId', { nullable: false }),
      query: t.exposeString('query', { nullable: false }),
      take: t.exposeInt('take', { nullable: false }),
      skip: t.exposeInt('skip', { nullable: false }),
      hitCount: t.exposeInt('hitCount', { nullable: false }),
      hits: t.field({
        type: [AiLibraryQueryHit],
        nullable: false,
        resolve: (parent) => {
          return parent.hits
        },
      }),
    }),
  })

builder.queryField('queryAiLibraryFiles', (t) =>
  t.withAuth({ isLoggedIn: true }).field({
    type: AiLibraryQueryResult,
    nullable: false,
    args: {
      libraryId: t.arg.string({ required: true }),
      query: t.arg.string({ required: true }),
      take: t.arg.int({ required: true }),
      skip: t.arg.int({ required: true }),
    },
    resolve: async (root, { libraryId, query, take, skip }, context) => {
      await canAccessLibraryOrThrow(context, libraryId)
      const searchResults = await queryVectorStore(libraryId, query, {
        page: !skip ? 1 : 1 + skip / take,
        perPage: take || 20,
      })
      return {
        libraryId,
        query,
        skip,
        take,
        hitCount: searchResults.hitCount,
        hits: searchResults.hits,
      }
    },
  }),
)
