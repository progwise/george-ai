import { builder } from './builder'
import './filters'
import './locales'
import './proposalSummary'
import './summary'
import './summaryFeedback'

export const schema = builder.toSchema()
