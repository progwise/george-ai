//import { GraphQLSchema } from 'graphql'
import { builder } from './builder'

import './scalars'
import './chat'
import './user'
import './ai-assistant'

console.log('after import')
const schema = builder.toSchema()

export { schema }
