import { GraphQLDateTime } from 'graphql-scalars'

import { builder } from '../builder'

console.log('Setting up: DateTime')

export const DateTimeScalar = builder.addScalarType(
  'DateTime',
  GraphQLDateTime,
  {},
)
