import { GraphQLDate } from 'graphql-scalars'

import { builder } from '../builder'

export const DateScalar = builder.addScalarType('Date', GraphQLDate, {})
