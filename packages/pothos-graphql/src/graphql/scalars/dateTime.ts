import { GraphQLDateTime } from 'graphql-scalars'

import { builder } from '../builder'

export const DateTimeScalar = builder.addScalarType('DateTime', GraphQLDateTime, {})
