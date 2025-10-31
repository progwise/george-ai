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
  documents: ['src/**/*.tsx', 'src/**/*.ts', '!src/gql/**/*'],
  generates: {
    './src/gql/': {
      preset: 'client',
      presetConfig: {
        fragmentMasking: false,
      },
    },
    './src/gql/validation.ts': {
      config: {
        schema: 'zod',
        importFrom: './graphql',
      },
      plugins: ['typescript-validation-schema'],
    },
    './src/gql/schema.graphql': {
      plugins: ['schema-ast'],
      config: {
        includeDirectives: true,
      },
    },
  },
  hooks: { afterOneFileWrite: ['prettier --write ./src/gql'] },
  config: {
    scalars: { Date: 'string', DateTime: 'string', Decimal: 'number' },
    dedupeFragments: true,
  },
}
export default config
