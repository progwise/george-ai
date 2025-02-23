import { builder } from '../builder'

console.log('Setting up: BigInt')

export const BigIntScalar = builder.scalarType('BigInt', {
  serialize: (value) => value.toString(),
  parseValue: (value) => {
    if (typeof value !== 'bigint') {
      throw new TypeError('BigInt must be a bigint')
    }
    return BigInt(value)
  },
})
