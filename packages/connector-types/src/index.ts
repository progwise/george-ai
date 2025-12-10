// Connectors - import to auto-register
import './shopware6'

/**
 * @george-ai/connector-types
 *
 * Connector type definitions and registry for George AI automations.
 */

// Core types needed by consumers
export type {
  ActionExecutionResult,
  ActionInput,
  ConnectorAction,
  ConnectorConfig,
  ConnectorType,
  ConnectorTypeFactory,
} from './types'

// Registry - main entry point
export { getConnectorAction, getConnectorTypeFactory, registerConnectorType } from './registry'

// Validation schemas
export { actionMappingsConfigSchema, connectorActionConfigSchema, rawActionConfigSchema } from './validation'
export type {
  ActionConfigValue,
  ActionFieldMapping,
  ActionMappingsConfig,
  ConnectorActionConfig,
  TransformType,
} from './validation'

// Transforms
export { substituteFieldValues, transformValue } from './transforms'
