import SchemaBuilder from '@pothos/core'
import { builder } from './builder'
import './search'
import './scrapedWebPage'

export const schema = builder.toSchema()
