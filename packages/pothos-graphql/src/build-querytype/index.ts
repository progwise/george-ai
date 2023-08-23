import { builder } from '../builder'
import { ScrapedWebPageReference, resolveAllPages } from '../scrapedWebPage'
import {
  PublicationState,
  TypesenseWebPageReference,
  resolveSearchResult,
} from '../search'

builder.queryType({
  fields: (t) => ({
    allPages: t.field({
      type: [ScrapedWebPageReference],
      resolve: resolveAllPages,
    }),
    searchResult: t.field({
      type: [TypesenseWebPageReference],
      args: {
        query: t.arg.string(),
        largeLanguageModel: t.arg.string(),
        publicationState: t.arg({
          type: PublicationState,
        }),
        language: t.arg.string(),
      },
      resolve: (parent, arguments_) =>
        resolveSearchResult(
          arguments_.query ?? '*',
          arguments_.largeLanguageModel ?? undefined,
          arguments_.publicationState ?? undefined,
          arguments_.language ?? undefined,
        ),
    }),
  }),
})
