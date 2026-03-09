import { WORKSPACE_ROLES } from '@george-ai/app-schema'

import { builder } from '../builder'

builder.enumType('WorkspaceRole', {
  description: 'The role of a user within a workspace',
  values: WORKSPACE_ROLES,
})
