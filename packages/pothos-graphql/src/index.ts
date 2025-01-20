import { builder } from './builder'

import './scalars'
import './chat'
import './user'
import './ai-assistant'

const schema = builder.toSchema()

export { schema }
