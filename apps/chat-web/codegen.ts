import type { CodegenConfig } from '@graphql-codegen/cli'
import 'dotenv/config'

const config: CodegenConfig = {
  schema: {
    'http://localhost:3003/graphql': {
      headers: {
        Authorization: `ApiKey ${process.env.GRAPHQL_API_KEY}`,
      },
    },
  },
  documents: ['app/**/*.tsx', 'app/**/*.ts', '!app/gql/**/*'],
  generates: {
    './app/gql/': {
      preset: 'client',
    },
    './app/gql/validation.ts': {
      config: {
        schema: 'zod',
        importFrom: './graphql',
      },
      plugins: ['typescript-validation-schema'],
    },
    './app/gql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
  hooks: { afterAllFileWrite: ['prettier --write'] },
}
export default config
