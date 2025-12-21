/**
 * Integration test: TREE_CONNECT command
 */
import { expect, it } from 'vitest'

import { createNegotiateRequest } from './protocol/commands/negotiate'
import {
  createSessionSetupRequest1,
  createSessionSetupRequest3,
  parseSessionSetupResponse,
} from './protocol/commands/session-setup'
import { createTreeConnectRequest, getShareTypeName, parseTreeConnectResponse } from './protocol/commands/tree-connect'
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

it('should connect to a share with TREE_CONNECT', async () => {
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

    // Step 2: SESSION_SETUP (Type 1)
    const sessionSetupRequest1 = createSessionSetupRequest1()
    const sessionSetupResponse1 = await connection.sendMessage(sessionSetupRequest1)
    expect(sessionSetupResponse1.isMoreProcessingRequired()).toBe(true)

    const sessionSetupData1 = parseSessionSetupResponse(sessionSetupResponse1)

    // Step 3: SESSION_SETUP (Type 3)
    const sessionSetupRequest3 = createSessionSetupRequest3(
      {
        domain: testConfig.domain,
        username: testConfig.username,
        password: testConfig.password,
        workstation: testConfig.workstation,
      },
      sessionSetupData1,
    )
    sessionSetupRequest3.header.sessionId = sessionSetupResponse1.header.sessionId

    const sessionSetupResponse3 = await connection.sendMessage(sessionSetupRequest3)
    expect(sessionSetupResponse3.isSuccess()).toBe(true)

    // Step 4: TREE_CONNECT to 'public' share
    const sharePath = `\\\\${testConfig.host}\\public`
    const treeConnectRequest = createTreeConnectRequest(sharePath, sessionSetupResponse3.header.sessionId)
    const treeConnectResponse = await connection.sendMessage(treeConnectRequest)

    expect(treeConnectResponse.isSuccess()).toBe(true)

    // Parse TREE_CONNECT response
    const treeConnectData = parseTreeConnectResponse(treeConnectResponse)

    // Verify tree ID was assigned
    expect(treeConnectResponse.header.treeId).toBeGreaterThan(0)

    // Verify share type is DISK
    expect(treeConnectData.shareType).toBe(0x01) // DISK
    expect(getShareTypeName(treeConnectData.shareType)).toBe('DISK')
  } finally {
    await connection.close()
  }
}, 20000)
