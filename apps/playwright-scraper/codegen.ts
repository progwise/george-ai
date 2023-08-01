import { CodegenConfig } from '@graphql-codegen/cli'
import dotenv from 'dotenv'

dotenv.config()
const config: CodegenConfig = {
  schema: {
    'http://localhost:1337/graphql': {
      headers: {
        Authorization: `Bearer ${process.env.STRAPI_API_KEY}`,
      },
    },
  },
  generates: {
    './src/gql/': {
      preset: 'client',
    },
  },
}

export default config
