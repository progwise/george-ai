import { builder } from '../builder'

export const NumberScalar = builder.scalarType('Number', {
  serialize: (value) => value,
  parseValue: (value) => {
    if (typeof value !== 'number') {
      throw new TypeError('Number must be a number')
    }
    return Number(value)
  },
})
