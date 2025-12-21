/**
 * Integration test: File operations (READ, QUERY_DIRECTORY, QUERY_INFO, CLOSE)
 */
import { describe, expect, it } from 'vitest'

import { CloseFlags, createCloseRequest, parseCloseResponse } from './protocol/commands/close'
import { createCreateRequest, parseCreateResponse } from './protocol/commands/create'
import { createNegotiateRequest } from './protocol/commands/negotiate'
import {
  FileInformationClass,
  createQueryDirectoryRequest,
  parseQueryDirectoryResponse,
} from './protocol/commands/query-directory'
import { FileInfoClass, InfoType, createQueryInfoRequest, parseQueryInfoResponse } from './protocol/commands/query-info'
import { createReadRequest, parseReadResponse } from './protocol/commands/read'
import {
  createSessionSetupRequest1,
  createSessionSetupRequest3,
  parseSessionSetupResponse,
} from './protocol/commands/session-setup'
import { createTreeConnectRequest } from './protocol/commands/tree-connect'
import { SMB2Connection } from './protocol/connection'
import { CreateDisposition, DesiredAccess, FileAttributes, ShareAccess } from './protocol/constants'

const testConfig = {
  host: 'gai-smb-test',
  port: 445,
  timeout: 10000,
  domain: 'WORKGROUP',
  username: 'testuser1',
  password: 'password123',
  workstation: 'TESTCLIENT',
}

describe('File Operations', () => {
  it('should read a file', async () => {
    const connection = new SMB2Connection({
      host: testConfig.host,
      port: testConfig.port,
      timeout: testConfig.timeout,
    })

    try {
      await connection.connect()

      // Authentication flow
      const negotiateRequest = createNegotiateRequest()
      const negotiateResponse = await connection.sendMessage(negotiateRequest)
      expect(negotiateResponse.isSuccess()).toBe(true)

      const sessionSetupRequest1 = createSessionSetupRequest1()
      const sessionSetupResponse1 = await connection.sendMessage(sessionSetupRequest1)
      expect(sessionSetupResponse1.isMoreProcessingRequired()).toBe(true)

      const sessionSetupData1 = parseSessionSetupResponse(sessionSetupResponse1)

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

      const sessionId = sessionSetupResponse3.header.sessionId

      // Connect to share
      const sharePath = `\\\\${testConfig.host}\\public`
      const treeConnectRequest = createTreeConnectRequest(sharePath, sessionId)
      const treeConnectResponse = await connection.sendMessage(treeConnectRequest)
      expect(treeConnectResponse.isSuccess()).toBe(true)

      const treeId = treeConnectResponse.header.treeId

      // Open file for reading (use file that exists - verified by query info test)
      const createRequest = createCreateRequest(
        {
          path: 'public_readme.md',
          desiredAccess: DesiredAccess.GENERIC_READ,
          fileAttributes: FileAttributes.NORMAL,
          shareAccess: ShareAccess.READ,
          createDisposition: CreateDisposition.OPEN,
          createOptions: 0,
        },
        sessionId,
        treeId,
      )

      const createResponse = await connection.sendMessage(createRequest)
      if (!createResponse.isSuccess()) {
        throw new Error(`CREATE failed: ${createResponse.getStatusString()}`)
      }

      const createData = parseCreateResponse(createResponse)
      const fileId = createData.fileId

      // Read file content (use small buffer to test READ command)
      const readRequest = createReadRequest(
        {
          fileId,
          offset: 0n,
          length: 1024, // Read first 1KB
        },
        sessionId,
        treeId,
      )

      const readResponse = await connection.sendMessage(readRequest)
      if (!readResponse.isSuccess()) {
        throw new Error(`READ failed: ${readResponse.getStatusString()}`)
      }

      const readData = parseReadResponse(readResponse)
      expect(readData.dataLength).toBeGreaterThan(0)
      expect(readData.buffer.length).toBe(readData.dataLength)

      // Verify content matches expected markdown format
      const content = readData.buffer.toString('utf8')
      expect(content).toContain('# Sample Markdown in public')

      // Close file
      const closeRequest = createCloseRequest(
        {
          fileId,
          flags: CloseFlags.POSTQUERY_ATTRIB,
        },
        sessionId,
        treeId,
      )

      const closeResponse = await connection.sendMessage(closeRequest)
      expect(closeResponse.isSuccess()).toBe(true)

      const closeData = parseCloseResponse(closeResponse)
      expect(closeData.endOfFile).toBeGreaterThan(0n)
      expect(closeData.fileAttributes).toBeGreaterThan(0)
    } finally {
      await connection.close()
    }
  })

  it('should list directory contents', async () => {
    const connection = new SMB2Connection({
      host: testConfig.host,
      port: testConfig.port,
      timeout: testConfig.timeout,
    })

    try {
      await connection.connect()

      // Authentication flow
      const negotiateRequest = createNegotiateRequest()
      const negotiateResponse = await connection.sendMessage(negotiateRequest)
      expect(negotiateResponse.isSuccess()).toBe(true)

      const sessionSetupRequest1 = createSessionSetupRequest1()
      const sessionSetupResponse1 = await connection.sendMessage(sessionSetupRequest1)
      expect(sessionSetupResponse1.isMoreProcessingRequired()).toBe(true)

      const sessionSetupData1 = parseSessionSetupResponse(sessionSetupResponse1)

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

      const sessionId = sessionSetupResponse3.header.sessionId

      // Connect to share
      const sharePath = `\\\\${testConfig.host}\\public`
      const treeConnectRequest = createTreeConnectRequest(sharePath, sessionId)
      const treeConnectResponse = await connection.sendMessage(treeConnectRequest)
      expect(treeConnectResponse.isSuccess()).toBe(true)

      const treeId = treeConnectResponse.header.treeId

      // Open announcements directory (exists in test data)
      const createRequest = createCreateRequest(
        {
          path: 'announcements',
          desiredAccess: DesiredAccess.GENERIC_READ,
          fileAttributes: FileAttributes.NORMAL,
          shareAccess: ShareAccess.READ | ShareAccess.WRITE,
          createDisposition: CreateDisposition.OPEN,
          createOptions: 0x00000001, // FILE_DIRECTORY_FILE
        },
        sessionId,
        treeId,
      )

      const createResponse = await connection.sendMessage(createRequest)
      if (!createResponse.isSuccess()) {
        throw new Error(`CREATE failed: ${createResponse.getStatusString()}`)
      }

      const createData = parseCreateResponse(createResponse)
      const fileId = createData.fileId

      // Query directory contents
      const queryDirRequest = createQueryDirectoryRequest(
        {
          fileId,
          searchPattern: '*',
          fileInformationClass: FileInformationClass.FileDirectoryInformation,
        },
        sessionId,
        treeId,
      )

      const queryDirResponse = await connection.sendMessage(queryDirRequest)
      expect(queryDirResponse.isSuccess()).toBe(true)

      const queryDirData = parseQueryDirectoryResponse(queryDirResponse)
      expect(queryDirData.outputBufferLength).toBeGreaterThan(0)
      expect(queryDirData.buffer.length).toBe(queryDirData.outputBufferLength)

      // Close directory
      const closeRequest = createCloseRequest({ fileId }, sessionId, treeId)
      const closeResponse = await connection.sendMessage(closeRequest)
      expect(closeResponse.isSuccess()).toBe(true)
    } finally {
      await connection.close()
    }
  })

  it('should query file information', async () => {
    const connection = new SMB2Connection({
      host: testConfig.host,
      port: testConfig.port,
      timeout: testConfig.timeout,
    })

    try {
      await connection.connect()

      // Authentication flow
      const negotiateRequest = createNegotiateRequest()
      const negotiateResponse = await connection.sendMessage(negotiateRequest)
      expect(negotiateResponse.isSuccess()).toBe(true)

      const sessionSetupRequest1 = createSessionSetupRequest1()
      const sessionSetupResponse1 = await connection.sendMessage(sessionSetupRequest1)
      expect(sessionSetupResponse1.isMoreProcessingRequired()).toBe(true)

      const sessionSetupData1 = parseSessionSetupResponse(sessionSetupResponse1)

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

      const sessionId = sessionSetupResponse3.header.sessionId

      // Connect to share
      const sharePath = `\\\\${testConfig.host}\\public`
      const treeConnectRequest = createTreeConnectRequest(sharePath, sessionId)
      const treeConnectResponse = await connection.sendMessage(treeConnectRequest)
      expect(treeConnectResponse.isSuccess()).toBe(true)

      const treeId = treeConnectResponse.header.treeId

      // Open file (use test file created by setup-testdata.sh)
      const createRequest = createCreateRequest(
        {
          path: 'public_readme.md',
          desiredAccess: DesiredAccess.GENERIC_READ,
          fileAttributes: FileAttributes.NORMAL,
          shareAccess: ShareAccess.READ,
          createDisposition: CreateDisposition.OPEN,
          createOptions: 0,
        },
        sessionId,
        treeId,
      )

      const createResponse = await connection.sendMessage(createRequest)
      if (!createResponse.isSuccess()) {
        throw new Error(`CREATE failed: ${createResponse.getStatusString()}`)
      }

      const createData = parseCreateResponse(createResponse)
      const fileId = createData.fileId

      // Query file basic information
      const queryInfoRequest = createQueryInfoRequest(
        {
          fileId,
          infoType: InfoType.FILE,
          fileInfoClass: FileInfoClass.FileBasicInformation,
        },
        sessionId,
        treeId,
      )

      const queryInfoResponse = await connection.sendMessage(queryInfoRequest)
      expect(queryInfoResponse.isSuccess()).toBe(true)

      const queryInfoData = parseQueryInfoResponse(queryInfoResponse)
      expect(queryInfoData.outputBufferLength).toBeGreaterThan(0)
      expect(queryInfoData.buffer.length).toBe(queryInfoData.outputBufferLength)

      // Basic information should be 40 bytes (per SMB2 spec)
      // CreationTime (8), LastAccessTime (8), LastWriteTime (8), ChangeTime (8), FileAttributes (4), Reserved (4)
      expect(queryInfoData.outputBufferLength).toBe(40)

      // Close file
      const closeRequest = createCloseRequest({ fileId }, sessionId, treeId)
      const closeResponse = await connection.sendMessage(closeRequest)
      expect(closeResponse.isSuccess()).toBe(true)
    } finally {
      await connection.close()
    }
  })
})
