import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

import { Prisma, getDatamodel, prisma } from '@george-ai/app-domain'
import type { PothosTypes, workspace } from '@george-ai/app-domain'

import { AUTOMATION_ITEM_STATUS, BATCH_STATUS, TRIGGER_TYPE } from '../domain/automation/constants'
import { EMBEDDING_STATUS, EXTRACTION_STATUS, PROCESSING_STATUS } from '../domain/content-extraction/task-status'
import { CRAWLER_URI_TYPES } from '../domain/crawler/crawler-uri-types'
import {
  LIST_FIELD_CONTEXT_TYPES,
  LIST_FIELD_FILE_PROPERTIES,
  LIST_FIELD_SOURCE_TYPES,
  LIST_FIELD_TYPES,
} from '../domain/list'
import { IS_PRODUCTION } from '../global-config'
import { Context, LoggedInContext } from './context'

const builder = new SchemaBuilder<{
  DefaultInputFieldRequiredness: true
  PrismaTypes: PothosTypes
  Context: Context
  AuthScopes: {
    isLoggedIn: boolean
  }
  AuthContexts: {
    isLoggedIn: LoggedInContext
  }
  Scalars: {
    ListFieldSourceType: {
      Input: (typeof LIST_FIELD_SOURCE_TYPES)[number]
      Output: (typeof LIST_FIELD_SOURCE_TYPES)[number]
    }
    ListFieldType: {
      Input: (typeof LIST_FIELD_TYPES)[number]
      Output: (typeof LIST_FIELD_TYPES)[number]
    }
    ListFieldFileProperty: {
      Input: (typeof LIST_FIELD_FILE_PROPERTIES)[number]
      Output: (typeof LIST_FIELD_FILE_PROPERTIES)[number]
    }
    ListFieldContextType: {
      Input: (typeof LIST_FIELD_CONTEXT_TYPES)[number]
      Output: (typeof LIST_FIELD_CONTEXT_TYPES)[number]
    }
    ProcessingStatus: {
      Input: (typeof PROCESSING_STATUS)[number]
      Output: (typeof PROCESSING_STATUS)[number]
    }
    WorkspaceProcessingType: {
      Input: (typeof workspace.WORKSPACE_PROCESSING_TYPE)[number]
      Output: (typeof workspace.WORKSPACE_PROCESSING_TYPE)[number]
    }
    ExtractionStatus: {
      Input: (typeof EXTRACTION_STATUS)[number]
      Output: (typeof EXTRACTION_STATUS)[number]
    }
    EmbeddingStatus: {
      Input: (typeof EMBEDDING_STATUS)[number]
      Output: (typeof EMBEDDING_STATUS)[number]
    }
    CrawlerUriType: {
      Input: (typeof CRAWLER_URI_TYPES)[number]
      Output: (typeof CRAWLER_URI_TYPES)[number]
    }
    AutomationItemStatus: {
      Input: (typeof AUTOMATION_ITEM_STATUS)[number]
      Output: (typeof AUTOMATION_ITEM_STATUS)[number]
    }
    BatchStatus: {
      Input: (typeof BATCH_STATUS)[number]
      Output: (typeof BATCH_STATUS)[number]
    }
    TriggerType: {
      Input: (typeof TRIGGER_TYPE)[number]
      Output: (typeof TRIGGER_TYPE)[number]
    }
    Date: {
      Input: Date
      Output: Date
    }
    DateTime: {
      Input: Date
      Output: Date
    }
    Decimal: {
      Input: Prisma.Decimal
      Output: Prisma.Decimal
    }
    BigInt: {
      Input: bigint
      Output: bigint
    }
  }
}>({
  defaultInputFieldRequiredness: true,
  plugins: [ScopeAuthPlugin, SimpleObjectsPlugin, PrismaPlugin],
  prisma: {
    client: prisma,
    dmmf: getDatamodel(),
    exposeDescriptions: true,
    filterConnectionTotalCount: true,
    onUnusedQuery: IS_PRODUCTION ? null : 'warn',
  },
  scopeAuth: {
    authScopes: async (context) => ({
      isLoggedIn: !!context.session,
    }),
    unauthorizedError: () => {
      throw Error('Unauthorized')
    },
  },
})

builder.queryType()
builder.mutationType()

export { builder }
