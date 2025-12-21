/**
 * Integration test: TCP connection to SMB server
 */
import { expect, it } from 'vitest'

import { SMB2Connection } from './protocol/connection'

const testConfig = {
  host: process.env.SMB_TEST_HOST || 'gai-smb-test',
  port: 445,
  timeout: 10000,
}

it('should connect to SMB server', async () => {
  const connection = new SMB2Connection({
    host: testConfig.host,
    port: testConfig.port,
    timeout: testConfig.timeout,
  })

  await connection.connect()
  expect(connection.isConnected()).toBe(true)

  await connection.close()
  expect(connection.isConnected()).toBe(false)
})
