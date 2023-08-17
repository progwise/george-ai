import dotenv from 'dotenv'

dotenv.config()

/** @type {import('graphql-config').IGraphQLConfig } */
module.exports = {
  projects: {
    nextjsWeb: {
      schema: {
        'http://localhost:3000/graphql': {
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
          },
        },
      },
      documents: ['apps/nextjs-web/app/**/*.tsx'],
      extensions: {
        codegen: {
          hooks: { afterOneFileWrite: ['prettier --write'] },
          generates: {
            'apps/nextjs-web/src/gql/': {
              preset: 'client',
            },
          },
        },
      },
    },
    playwrightScraper: {
      schema: {
        'http://localhost:1337/graphql': {
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
          },
        },
      },
      documents: ['apps/playwright-scraper/src/**/*.ts'],
      extensions: {
        codegen: {
          hooks: { afterOneFileWrite: ['prettier --write'] },
          generates: {
            'apps/playwright-scraper/src/gql/': {
              preset: 'client',
            },
          },
        },
      },
    },
    pothosGraphql: {
      schema: {
        'http://localhost:1337/graphql': {
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
          },
        },
      },
      documents: ['packages/pothos-graphql/src/**/*.ts'],
      extensions: {
        codegen: {
          hooks: { afterOneFileWrite: ['prettier --write'] },
          generates: {
            'packages/pothos-graphql/src/gql/': {
              preset: 'client',
            },
          },
        },
      },
    },
  },
}
