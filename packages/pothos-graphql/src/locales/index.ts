import { getStrapiLocales } from '@george-ai/strapi-client'
import { builder } from '../builder'

const Locales = builder.simpleObject('Locales', {
  fields: (t) => ({
    locales: t.stringList(),
  }),
})

builder.queryField('locales', (t) =>
  t.field({
    type: Locales,
    resolve: async () => {
      await getStrapiLocales()
      return { locales: await getStrapiLocales() }
    },
  }),
)
