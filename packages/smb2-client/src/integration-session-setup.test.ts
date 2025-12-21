/**
 * Integration test: SESSION_SETUP command (NTLM v2 authentication)
 */
import { describe, expect, it } from 'vitest'

import { createNegotiateRequest } from './protocol/commands/negotiate'
import {
  createSessionSetupRequest1,
  createSessionSetupRequest3,
  parseSessionSetupResponse,
} from './protocol/commands/session-setup'
import { SMB2Connection } from './protocol/connection'

const testConfig = {
  host: 'gai-smb-test',
  port: 445,
  timeout: 10000,
  domain: 'WORKGROUP',
  username: 'testuser1',
  password: 'password123',
  workstation: 'TESTCLIENT',
}

describe('SESSION_SETUP', () => {
  it('should authenticate with NTLM v2', async () => {
    const connection = new SMB2Connection({
      host: testConfig.host,
      port: testConfig.port,
      timeout: testConfig.timeout,
    })

    try {
      await connection.connect()

      // Step 1: NEGOTIATE
      const negotiateRequest = createNegotiateRequest()
      const negotiateResponse = await connection.sendMessage(negotiateRequest)
      expect(negotiateResponse.isSuccess()).toBe(true)

      // Step 2: SESSION_SETUP Type 1 (NEGOTIATE)
      const sessionSetupRequest1 = createSessionSetupRequest1()
      const sessionSetupResponse1 = await connection.sendMessage(sessionSetupRequest1)

      // Should return MORE_PROCESSING_REQUIRED with Type 2 (CHALLENGE)
      expect(sessionSetupResponse1.isMoreProcessingRequired()).toBe(true)

      const sessionSetupData1 = parseSessionSetupResponse(sessionSetupResponse1)
      expect(sessionSetupData1.securityBuffer.length).toBeGreaterThan(0)

      // Step 3: SESSION_SETUP Type 3 (AUTHENTICATE)
      const sessionSetupRequest3 = createSessionSetupRequest3(
        {
          domain: testConfig.domain,
          username: testConfig.username,
          password: testConfig.password,
          workstation: testConfig.workstation,
        },
        sessionSetupData1,
      )

      // Use session ID from Type 2 response
      sessionSetupRequest3.header.sessionId = sessionSetupResponse1.header.sessionId

      const sessionSetupResponse3 = await connection.sendMessage(sessionSetupRequest3)

      // Should return SUCCESS
      expect(sessionSetupResponse3.isSuccess()).toBe(true)

      const sessionSetupData3 = parseSessionSetupResponse(sessionSetupResponse3)

      // Verify authentication was successful (not guest or null session)
      expect((sessionSetupData3.sessionFlags & 0x0001) === 0).toBe(true) // Not guest
      expect((sessionSetupData3.sessionFlags & 0x0002) === 0).toBe(true) // Not null
    } finally {
      await connection.close()
    }
  })

  it('should reject invalid credentials', async () => {
    const connection = new SMB2Connection({
      host: testConfig.host,
      port: testConfig.port,
      timeout: testConfig.timeout,
    })

    try {
      await connection.connect()

      // NEGOTIATE
      const negotiateRequest = createNegotiateRequest()
      const negotiateResponse = await connection.sendMessage(negotiateRequest)
      expect(negotiateResponse.isSuccess()).toBe(true)

      // SESSION_SETUP Type 1
      const sessionSetupRequest1 = createSessionSetupRequest1()
      const sessionSetupResponse1 = await connection.sendMessage(sessionSetupRequest1)
      expect(sessionSetupResponse1.isMoreProcessingRequired()).toBe(true)

      const sessionSetupData1 = parseSessionSetupResponse(sessionSetupResponse1)

      // SESSION_SETUP Type 3 with WRONG password
      const sessionSetupRequest3 = createSessionSetupRequest3(
        {
          domain: testConfig.domain,
          username: testConfig.username,
          password: 'WRONG_PASSWORD',
          workstation: testConfig.workstation,
        },
        sessionSetupData1,
      )

      sessionSetupRequest3.header.sessionId = sessionSetupResponse1.header.sessionId

      const sessionSetupResponse3 = await connection.sendMessage(sessionSetupRequest3)

      // Should NOT be successful
      expect(sessionSetupResponse3.isSuccess()).toBe(false)
    } finally {
      await connection.close()
    }
  })
})
