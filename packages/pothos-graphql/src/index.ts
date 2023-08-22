import SchemaBuilder from '@pothos/core'
import { builder } from './builder'
import './build-querytype'

export const schema = builder.toSchema()
