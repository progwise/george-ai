import { builder } from '../builder'
import { PublicationState } from '../gql/graphql'
import { ScrapedWebPageReference, resolveAllPages } from '../scrapedWebPage'
import { TypesenseWebPageReference, resolveSearchResult } from '../search'

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
        publicationState: t.arg.string(),
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
