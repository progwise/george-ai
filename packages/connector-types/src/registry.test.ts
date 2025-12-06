import { describe, expect, it } from 'vitest'
import { z } from 'zod'

import { getConnectorTypeFactory, registerConnectorType } from './registry'
import type { ConnectorType } from './types'

const mockConnectorType: ConnectorType = {
  id: 'test-connector',
  name: 'Test Connector',
  description: 'A test connector',
  icon: 'test-icon',
  authType: 'api_key',
  credentialsSchema: z.object({
    apiKey: z.string(),
    publicField: z.string(),
  }),
  sensitiveFields: ['apiKey'],
  actions: [],
  testConnection: async () => ({ success: true }),
}

describe('registry', () => {
  it('registers and retrieves connector types', () => {
    registerConnectorType(mockConnectorType)

    const factory = getConnectorTypeFactory()
    const retrieved = factory.getType('test-connector')

    expect(retrieved).toBeDefined()
    expect(retrieved?.id).toBe('test-connector')
    expect(retrieved?.name).toBe('Test Connector')
  })

  it('returns undefined for unknown connector type', () => {
    const factory = getConnectorTypeFactory()
    expect(factory.getType('unknown')).toBeUndefined()
  })

  it('lists available connector types', () => {
    const factory = getConnectorTypeFactory()
    const types = factory.getAvailableTypes()

    expect(types.length).toBeGreaterThan(0)
    expect(types.some((t) => t.id === 'test-connector')).toBe(true)
  })

  it('removes sensitive fields in getConfigForDisplay', () => {
    const factory = getConnectorTypeFactory()
    const config = { apiKey: 'secret123', publicField: 'visible' }

    const displayConfig = factory.getConfigForDisplay('test-connector', config)

    expect(displayConfig).toEqual({ publicField: 'visible' })
    expect(displayConfig).not.toHaveProperty('apiKey')
  })
})
