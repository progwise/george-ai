import { AUTOMATION_BATCH_STATUS } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.enumType('AutomationBatchStatus', { values: AUTOMATION_BATCH_STATUS })
