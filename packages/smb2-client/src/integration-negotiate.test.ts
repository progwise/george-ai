/**
 * Integration test: NEGOTIATE command
 */
import { expect, it } from 'vitest'

import { createNegotiateRequest, parseNegotiateResponse } from './protocol/commands/negotiate'
import { SMB2Connection } from './protocol/connection'

const testConfig = {
  host: 'gai-smb-test',
  port: 445,
  timeout: 10000,
}

it('should negotiate SMB2 protocol', async () => {
  const connection = new SMB2Connection({
    host: testConfig.host,
    port: testConfig.port,
    timeout: testConfig.timeout,
  })

  try {
    await connection.connect()

    // Send NEGOTIATE request
    const negotiateRequest = createNegotiateRequest()
    const negotiateResponse = await connection.sendMessage(negotiateRequest)

    expect(negotiateResponse.isSuccess()).toBe(true)

    // Parse NEGOTIATE response
    const negotiateData = parseNegotiateResponse(negotiateResponse)

    // Server should negotiate one of the dialects we offered
    expect(negotiateData.dialectRevision).toBeGreaterThan(0)
  } finally {
    await connection.close()
  }
})
