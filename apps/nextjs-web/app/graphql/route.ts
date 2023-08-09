// Next.js Custom Route Handler: https://nextjs.org/docs/app/building-your-application/routing/router-handlers
import { schema } from '@george-ai/pothos-graphql'
 import { createYoga } from 'graphql-yoga'
const { handleRequest } = createYoga({
  schema,
 
  // While using Next.js file convention for routing, we need to configure Yoga to use the correct endpoint
  graphqlEndpoint: '/graphql',
 
  // Yoga needs to know how to create a valid Next response
  fetchAPI: { Response }
})
 
export { handleRequest as GET, handleRequest as POST }