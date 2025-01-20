import { Prisma } from '@progwise/gai-prisma'

import { builder } from '../builder'

console.log('Setting up: Decimal')

export const DecimalScalar = builder.scalarType('Decimal', {
  serialize: (value) => value.toString(),
  parseValue: (value) => {
    if (typeof value !== 'string') {
      throw new TypeError('Decimal must be a string')
    }
    return new Prisma.Decimal(value)
  },
})
