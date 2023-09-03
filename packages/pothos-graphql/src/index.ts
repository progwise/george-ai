import SchemaBuilder from '@pothos/core'
import { builder } from './builder'
import './search'
import './WebPageSummary'

export const schema = builder.toSchema()
