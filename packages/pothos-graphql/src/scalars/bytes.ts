import { GraphQLString } from 'graphql'
import { builder } from '../builder'

console.log('Setting up: Bytes')

export const Bytes = builder.addScalarType('Bytes', GraphQLString, {})
