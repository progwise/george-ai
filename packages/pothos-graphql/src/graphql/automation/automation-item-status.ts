import { AUTOMATION_ITEM_STATUS } from '@george-ai/app-domain'

import { builder } from '../builder'

builder.enumType('AutomationItemStatus', { values: AUTOMATION_ITEM_STATUS })
