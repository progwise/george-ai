import SchemaBuilder from '@pothos/core'
import PrismaPlugin from '@pothos/plugin-prisma'
import ScopeAuthPlugin from '@pothos/plugin-scope-auth'
import SimpleObjectsPlugin from '@pothos/plugin-simple-objects'

import { EMBEDDING_STATUS, EXTRACTION_METHODS, MODEL_PROVIDERS, STORAGE_STATUS } from '@george-ai/app-commons'
import { Prisma, getDatamodel, prisma } from '@george-ai/app-database'
import type { PothosTypes } from '@george-ai/app-database'
import { Context, LoggedInContext } from '@george-ai/app-domain'
import { modelCalls, providerHealth, workerRegistry, workspaceProcessing } from '@george-ai/event-service-client'

import config from '../config'
import { AUTOMATION_ITEM_STATUS, BATCH_STATUS, TRIGGER_TYPE } from '../domain/automation/constants'
import { CRAWLER_URI_TYPES } from '../domain/crawler/crawler-uri-types'
import {
  LIST_FIELD_CONTEXT_TYPES,
  LIST_FIELD_FILE_PROPERTIES,
  LIST_FIELD_SOURCE_TYPES,
  LIST_FIELD_TYPES,
} from '../domain/list'
import { GeorgeTypes } from './george-types'

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
  Objects: GeorgeTypes
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
    StorageStatus: {
      Input: (typeof STORAGE_STATUS)[number]
      Output: (typeof STORAGE_STATUS)[number]
    }
    EmbeddingStatus: {
      Input: (typeof EMBEDDING_STATUS)[number]
      Output: (typeof EMBEDDING_STATUS)[number]
    }
    ExtractionMethod: {
      Input: (typeof EXTRACTION_METHODS)[number]
      Output: (typeof EXTRACTION_METHODS)[number] | string
    }
    ModelCallType: {
      Input: (typeof modelCalls.MODEL_CALL_TYPES)[number]
      Output: (typeof modelCalls.MODEL_CALL_TYPES)[number]
    }
    ProviderHealthStatus: {
      Input: (typeof providerHealth.HEALTH_STATUS)[number]
      Output: (typeof providerHealth.HEALTH_STATUS)[number]
    }
    ProcessingStatus: {
      Input: (typeof workspaceProcessing.EVENT_PROCESSING_STATUS)[number]
      Output: (typeof workspaceProcessing.EVENT_PROCESSING_STATUS)[number]
    }
    ActionType: {
      Input: (typeof workspaceProcessing.ACTION_TYPES)[number]
      Output: (typeof workspaceProcessing.ACTION_TYPES)[number]
    }
    WorkerType: {
      Input: (typeof workerRegistry.WORKER_TYPES)[number]
      Output: (typeof workerRegistry.WORKER_TYPES)[number]
    }
    EventProcessingStatus: {
      Input: (typeof workspaceProcessing.EVENT_PROCESSING_STATUS)[number]
      Output: (typeof workspaceProcessing.EVENT_PROCESSING_STATUS)[number]
    }
    ModelProvider: {
      Input: (typeof MODEL_PROVIDERS)[number]
      Output: (typeof MODEL_PROVIDERS)[number]
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
      Output: string | Date
    }
    DateTime: {
      Input: Date
      Output: string | Date
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
    onUnusedQuery: config('IS_PRODUCTION') ? null : 'warn',
  },
  scopeAuth: {
    authScopes: async (context) => {
      return {
        isLoggedIn: !!context.session,
      }
    },
    unauthorizedError: () => {
      throw Error('Unauthorized')
    },
  },
})

builder.queryType()
builder.mutationType()

export { builder }
