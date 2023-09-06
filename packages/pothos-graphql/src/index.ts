import SchemaBuilder from '@pothos/core'
import { builder } from './builder'
import './search'
import './webPageSummary'
import './findLangAndLlm'

export const schema = builder.toSchema()
