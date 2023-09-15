import { graphql } from './gql'
import { strapiClient } from './strapi-client'

export const getStrapiLocales = async () => {
  try {
    const { i18NLocales } = await strapiClient.request(
      graphql(`
        query GetAllLocales {
          i18NLocales {
            data {
              id
              attributes {
                code
              }
            }
          }
        }
      `),
      {},
    )

    const localeCodes =
      (i18NLocales?.data
        ?.map((locale) => locale.attributes?.code)
        .filter(Boolean) as string[]) || []
    return localeCodes
  } catch (error) {
    console.error('Error fetching Strapi locales:', error)
    return []
  }
}
