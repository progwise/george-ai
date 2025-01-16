import type { CodegenConfig } from '@graphql-codegen/cli'

const config: CodegenConfig = {
  schema: 'http://localhost:3003',
  documents: ['app/**/*.tsx', 'app/**/*.ts', '!app/gql/**/*'],
  generates: {
    './app/gql/': {
      preset: 'client',
    },
  },
}
export default config
