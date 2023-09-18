import { GraphQLClient } from 'graphql-request'

const endpoint = 'http://localhost:1337/graphql'
export const strapiClient = new GraphQLClient(endpoint, {
  headers: {
    authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
  },
})
