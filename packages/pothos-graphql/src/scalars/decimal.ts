import { Prisma } from '@george-ai/prismaClient'

import { builder } from '../builder'

export const DecimalScalar = builder.scalarType('Decimal', {
  serialize: (value) => value.toString(),
  parseValue: (value) => {
    if (typeof value !== 'string') {
      throw new TypeError('Decimal must be a string')
    }
    return new Prisma.Decimal(value)
  },
})
