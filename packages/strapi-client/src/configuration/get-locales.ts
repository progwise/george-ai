import { graphql } from '../gql'
import { strapiClient } from '../strapi-client'

export const getStrapiLocales = async () => {
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

  return (
    i18NLocales?.data
      ?.map((locale) => locale.attributes?.code)
      .filter((id): id is string => typeof id === 'string') || []
  )
}
