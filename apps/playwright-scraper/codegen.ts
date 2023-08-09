import { CodegenConfig } from '@graphql-codegen/cli'
import dotenv from 'dotenv'

dotenv.config()
const config: CodegenConfig = {
  schema: {
    'http://localhost:1337/graphql': {
      headers: {
        // eslint-disable-next-line turbo/no-undeclared-env-vars
        Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
      },
    },
  },
  hooks: { afterOneFileWrite: ['prettier --write'] },
  documents: 'src/**/*.ts',
  generates: {
    './src/gql/': {
      preset: 'client',
    },
  },
}

export default config
