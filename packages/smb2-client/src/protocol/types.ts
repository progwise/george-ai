/**
 * SMB2 Protocol Types
 *
 * TypeScript type definitions for SMB2 protocol structures
 */
import type { NTStatus, SMB2Command, SMB2Dialect } from './constants'

/**
 * SMB2 Header (64 bytes fixed)
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/fb188936-5050-48d3-b350-dc43059638a4
 */
export interface SMB2Header {
  /** Protocol ID (\xFESMB) */
  protocolId: Buffer
  /** Structure size (must be 64) */
  structureSize: number
  /** Credit charge (for flow control) */
  creditCharge: number
  /** Channel sequence (SMB 3.x) */
  channelSequence: number
  /** Status code (NT_STATUS) */
  status: NTStatus
  /** Command code */
  command: SMB2Command
  /** Credits requested/granted */
  creditRequest: number
  /** Flags */
  flags: number
  /** Next command offset (for compound requests) */
  nextCommand: number
  /** Message ID (unique per connection) */
  messageId: bigint
  /** Reserved (MUST be 0) */
  reserved: number
  /** Tree ID (for tree connect) */
  treeId: number
  /** Session ID */
  sessionId: bigint
  /** Signature (16 bytes, zeros if not signed) */
  signature: Buffer
}

/**
 * Negotiation Context
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/bc613d2d-3628-4469-b8bb-40e8f53f2d55
 */
export interface NegotiateContext {
  /** Context type */
  contextType: number
  /** Data length */
  dataLength: number
  /** Reserved */
  reserved: number
  /** Context data */
  data: Buffer
}

/**
 * NEGOTIATE Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e14db7ff-763a-4263-8b10-0c3944f52fc5
 */
export interface NegotiateRequest {
  /** Structure size (must be 36) */
  structureSize: number
  /** Dialect count */
  dialectCount: number
  /** Security mode */
  securityMode: number
  /** Reserved */
  reserved: number
  /** Capabilities */
  capabilities: number
  /** Client GUID */
  clientGuid: Buffer
  /** Negotiate context offset (SMB 3.1.1) */
  negotiateContextOffset?: number
  /** Negotiate context count (SMB 3.1.1) */
  negotiateContextCount?: number
  /** Reserved2 */
  reserved2?: number
  /** Dialects array */
  dialects: SMB2Dialect[]
  /** Negotiate contexts (SMB 3.1.1) */
  negotiateContexts?: NegotiateContext[]
}

/**
 * NEGOTIATE Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/f7c9eb23-7129-4bf2-89b6-e8d0f8c62726
 */
export interface NegotiateResponse {
  /** Structure size (must be 65) */
  structureSize: number
  /** Security mode */
  securityMode: number
  /** Dialect revision */
  dialectRevision: SMB2Dialect
  /** Negotiate context count (SMB 3.1.1) */
  negotiateContextCount?: number
  /** Server GUID */
  serverGuid: Buffer
  /** Capabilities */
  capabilities: number
  /** Max transaction size */
  maxTransactSize: number
  /** Max read size */
  maxReadSize: number
  /** Max write size */
  maxWriteSize: number
  /** System time */
  systemTime: bigint
  /** Server start time */
  serverStartTime: bigint
  /** Security buffer offset */
  securityBufferOffset: number
  /** Security buffer length */
  securityBufferLength: number
  /** Negotiate context offset (SMB 3.1.1) */
  negotiateContextOffset?: number
  /** Security buffer (SPNEGO token) */
  securityBuffer: Buffer
  /** Negotiate contexts (SMB 3.1.1) */
  negotiateContexts?: NegotiateContext[]
}

/**
 * SESSION_SETUP Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/5c5e5b77-b998-4f43-afa1-22842ca38718
 */
export interface SessionSetupRequest {
  /** Structure size (must be 25) */
  structureSize: number
  /** Flags */
  flags: number
  /** Security mode */
  securityMode: number
  /** Capabilities */
  capabilities: number
  /** Channel */
  channel: number
  /** Security buffer offset */
  securityBufferOffset: number
  /** Security buffer length */
  securityBufferLength: number
  /** Previous session ID (for re-authentication) */
  previousSessionId: bigint
  /** Security buffer (NTLM/Kerberos token) */
  securityBuffer: Buffer
}

/**
 * SESSION_SETUP Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/32b504e0-8a9c-45e1-bedb-5955a3f2ddff
 */
export interface SessionSetupResponse {
  /** Structure size (must be 9) */
  structureSize: number
  /** Session flags */
  sessionFlags: number
  /** Security buffer offset */
  securityBufferOffset: number
  /** Security buffer length */
  securityBufferLength: number
  /** Security buffer (NTLM/Kerberos token) */
  securityBuffer: Buffer
}

/**
 * TREE_CONNECT Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/451908b4-85a9-4f29-a1ec-8f3b19d72bec
 */
export interface TreeConnectRequest {
  /** Structure size (must be 9) */
  structureSize: number
  /** Flags (SMB 3.1.1) */
  flags?: number
  /** Path offset */
  pathOffset: number
  /** Path length */
  pathLength: number
  /** Path (UNC path to share) */
  path: string
}

/**
 * TREE_CONNECT Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/da1a37a7-5f05-4433-9cf8-1c26c6e9bd5f
 */
export interface TreeConnectResponse {
  /** Structure size (must be 16) */
  structureSize: number
  /** Share type */
  shareType: number
  /** Reserved */
  reserved: number
  /** Share flags */
  shareFlags: number
  /** Capabilities */
  capabilities: number
  /** Maximal access */
  maximalAccess: number
}

/**
 * CREATE Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export interface CreateRequest {
  /** Structure size (must be 57) */
  structureSize: number
  /** Security flags */
  securityFlags: number
  /** Requested oplock level */
  requestedOplockLevel: number
  /** Impersonation level */
  impersonationLevel: number
  /** SMB create flags */
  smbCreateFlags: bigint
  /** Reserved */
  reserved: bigint
  /** Desired access */
  desiredAccess: number
  /** File attributes */
  fileAttributes: number
  /** Share access */
  shareAccess: number
  /** Create disposition */
  createDisposition: number
  /** Create options */
  createOptions: number
  /** Name offset */
  nameOffset: number
  /** Name length */
  nameLength: number
  /** Create contexts offset */
  createContextsOffset: number
  /** Create contexts length */
  createContextsLength: number
  /** Name (file/directory path) */
  name: string
  /** Create contexts */
  createContexts?: Buffer
}

/**
 * CREATE Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/d166aa9e-0b53-410e-b35e-3933d8131927
 */
export interface CreateResponse {
  /** Structure size (must be 89) */
  structureSize: number
  /** Oplock level granted */
  oplockLevel: number
  /** Flags */
  flags: number
  /** Create action */
  createAction: number
  /** Creation time */
  creationTime: bigint
  /** Last access time */
  lastAccessTime: bigint
  /** Last write time */
  lastWriteTime: bigint
  /** Change time */
  changeTime: bigint
  /** Allocation size */
  allocationSize: bigint
  /** End of file */
  endOfFile: bigint
  /** File attributes */
  fileAttributes: number
  /** Reserved2 */
  reserved2: number
  /** File ID (16 bytes) */
  fileId: Buffer
  /** Create contexts offset */
  createContextsOffset: number
  /** Create contexts length */
  createContextsLength: number
  /** Create contexts */
  createContexts?: Buffer
}

/**
 * READ Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e7046961-3318-4350-be2a-a8d69bb59ce8
 */
export interface ReadRequest {
  /** Structure size (must be 49) */
  structureSize: number
  /** Padding */
  padding: number
  /** Flags */
  flags: number
  /** Length */
  length: number
  /** Offset */
  offset: bigint
  /** File ID (16 bytes) */
  fileId: Buffer
  /** Minimum count */
  minimumCount: number
  /** Channel */
  channel: number
  /** Remaining bytes */
  remainingBytes: number
  /** Read channel info offset */
  readChannelInfoOffset: number
  /** Read channel info length */
  readChannelInfoLength: number
  /** Buffer */
  buffer?: Buffer
}

/**
 * READ Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/a5eaa17e-d070-49d8-85cb-e01a8b5ba776
 */
export interface ReadResponse {
  /** Structure size (must be 17) */
  structureSize: number
  /** Data offset */
  dataOffset: number
  /** Reserved */
  reserved: number
  /** Data length */
  dataLength: number
  /** Data remaining */
  dataRemaining: number
  /** Reserved2 */
  reserved2: number
  /** Data buffer */
  buffer: Buffer
}

/**
 * CLOSE Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/ae37dad2-ce5e-4f0c-a694-daa7b2f54864
 */
export interface CloseRequest {
  /** Structure size (must be 24) */
  structureSize: number
  /** Flags */
  flags: number
  /** Reserved */
  reserved: number
  /** File ID (16 bytes) */
  fileId: Buffer
}

/**
 * CLOSE Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/bbb9c923-1715-4431-b88d-40eedd61fb7d
 */
export interface CloseResponse {
  /** Structure size (must be 60) */
  structureSize: number
  /** Flags */
  flags: number
  /** Reserved */
  reserved: number
  /** Creation time */
  creationTime: bigint
  /** Last access time */
  lastAccessTime: bigint
  /** Last write time */
  lastWriteTime: bigint
  /** Change time */
  changeTime: bigint
  /** Allocation size */
  allocationSize: bigint
  /** End of file */
  endOfFile: bigint
  /** File attributes */
  fileAttributes: number
}

/**
 * QUERY_DIRECTORY Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/2f7eac10-f80e-44f5-9087-92e640d1ed0f
 */
export interface QueryDirectoryRequest {
  /** Structure size (must be 33) */
  structureSize: number
  /** File information class */
  fileInformationClass: number
  /** Flags */
  flags: number
  /** File index */
  fileIndex: number
  /** File ID (16 bytes) */
  fileId: Buffer
  /** File name offset */
  fileNameOffset: number
  /** File name length */
  fileNameLength: number
  /** Output buffer length */
  outputBufferLength: number
  /** File name (search pattern) */
  fileName?: string
}

/**
 * QUERY_DIRECTORY Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/8ec1ddf5-0e14-45cf-bfb2-2e05fb2a11bb
 */
export interface QueryDirectoryResponse {
  /** Structure size (must be 9) */
  structureSize: number
  /** Output buffer offset */
  outputBufferOffset: number
  /** Output buffer length */
  outputBufferLength: number
  /** Output buffer */
  buffer: Buffer
}

/**
 * QUERY_INFO Request
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/9362e92f-e4bf-428a-b40c-42abeaa6ef2e
 */
export interface QueryInfoRequest {
  /** Structure size (must be 41) */
  structureSize: number
  /** Info type */
  infoType: number
  /** File information class */
  fileInfoClass: number
  /** Output buffer length */
  outputBufferLength: number
  /** Input buffer offset */
  inputBufferOffset: number
  /** Reserved */
  reserved: number
  /** Input buffer length */
  inputBufferLength: number
  /** Additional information */
  additionalInformation: number
  /** Flags */
  flags: number
  /** File ID (16 bytes) */
  fileId: Buffer
  /** Input buffer */
  buffer?: Buffer
}

/**
 * QUERY_INFO Response
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/37e5e3e2-85a2-4c93-8074-0b98a4a130fb
 */
export interface QueryInfoResponse {
  /** Structure size (must be 9) */
  structureSize: number
  /** Output buffer offset */
  outputBufferOffset: number
  /** Output buffer length */
  outputBufferLength: number
  /** Output buffer */
  buffer: Buffer
}

/**
 * File Metadata (High-level)
 */
export interface FileMetadata {
  /** File name */
  name: string
  /** File size in bytes */
  size: number
  /** Is directory */
  isDirectory: boolean
  /** Is readonly */
  isReadonly: boolean
  /** Is hidden */
  isHidden: boolean
  /** Creation time */
  createdAt: Date
  /** Last modified time */
  modifiedAt: Date
  /** Last accessed time */
  accessedAt: Date
  /** File attributes */
  attributes: number
}
