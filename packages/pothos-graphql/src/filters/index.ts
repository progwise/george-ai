import { builder } from '../builder'
import { fetchGroupedValues } from '@george-ai/typesense-client'

const filters = builder.simpleObject('filters', {
  fields: (t) => ({
    language: t.stringList(),
    largeLanguageModel: t.stringList(),
    publicationState: t.stringList(),
  }),
})

builder.queryField('filters', (t) =>
  t.field({
    type: filters,
    resolve: async () => {
      const [language, largeLanguageModel, publicationState] =
        await Promise.all([
          fetchGroupedValues('language'),
          fetchGroupedValues('largeLanguageModel'),
          fetchGroupedValues('publicationState'),
        ])

      return {
        language,
        largeLanguageModel,
        publicationState,
      }
    },
  }),
)
