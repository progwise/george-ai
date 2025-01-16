import { GraphQLDate } from 'graphql-scalars'

import { builder } from '../builder'

console.log('Setting up: Date')

export const DateScalar = builder.addScalarType('Date', GraphQLDate, {})
