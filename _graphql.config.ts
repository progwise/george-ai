const dotenv = require('dotenv')

dotenv.config()

module.exports = {
  projects: {
    playwrightScraper: {
      schema: {
        'http://localhost:1337/graphql': {
          headers: {
            Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
          },
        },
      },
      documents: [
        'apps/playwright-scraper/src/**/*.ts',
        'packages/pothos-graphql/src/**/*.ts',
      ],
      extensions: {
        codegen: {
          hooks: { afterOneFileWrite: ['prettier --write'] },
          generates: {
            'src/gql/': {
              preset: 'client',
              plugins: ['typescript', 'typed-document-node'],
            },
          },
        },
      },
    },
  },
}
