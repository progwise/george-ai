import { exec } from 'child_process'
import { describe, expect, it } from 'vitest'

import { SMBClient } from './index'

// Debug test to understand SMB server state
describe('SMB Server Debug', () => {
  it('should list available shares using smbclient -L', async () => {
    const command = 'smbclient -L gai-smb-test -U testuser1%password123'

    const result = await new Promise<string>((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(new Error(`Command failed: ${error.message}\nStderr: ${stderr}`))
          return
        }
        resolve(stdout)
      })
    })

    console.log('Available shares:', result)
    expect(result).toContain('Sharename')
  })

  it('should try connecting to IPC$ share', async () => {
    const client = new SMBClient({
      username: 'testuser1',
      password: 'password123',
    })

    // Try to connect to IPC$ which we know exists
    try {
      await client.listFiles('smb://gai-smb-test/IPC$/')
    } catch (error) {
      console.log('IPC$ connection error (expected):', error)
      // IPC$ is not a normal share, so this should fail in a specific way
      expect(error).toBeDefined()
    }
  })

  it('should check if testuser1 credentials work', async () => {
    const command = 'smbclient //gai-smb-test/IPC$ -U testuser1%password123 -c "exit"'

    const result = await new Promise<{ success: boolean; output: string }>((resolve) => {
      exec(command, (error, stdout, stderr) => {
        resolve({
          success: !error,
          output: error ? `${error.message}\n${stderr}` : stdout,
        })
      })
    })

    console.log('Credential test result:', result)
    // Even if this fails, we want to see what the error is
    expect(result).toBeDefined()
  })
})
