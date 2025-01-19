import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3003',
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
}
export default config
