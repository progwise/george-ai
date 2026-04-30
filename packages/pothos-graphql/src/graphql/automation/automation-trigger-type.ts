import { AUTOMATION_TRIGGER_TYPE } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.enumType('AutomationTriggerType', {
  description: 'Trigger type for an automation batch execution',
  values: AUTOMATION_TRIGGER_TYPE,
})
