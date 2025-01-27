import { builder } from './builder'

import './scalars'
import './chat'
import './user'
import './ai-assistant'
import './ai-knowledge-source'
import './ai-knowledge-source-file'

const schema = builder.toSchema()

export { schema }
