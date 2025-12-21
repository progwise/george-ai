/**
 * SMB2 Protocol Constants
 *
 * Based on Microsoft SMB2 Protocol Specification:
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/
 */

/** SMB2 Protocol ID */
export const SMB2_PROTOCOL_ID = Buffer.from([0xfe, 0x53, 0x4d, 0x42]) // "\xFESMB"

/** SMB2 Header Size (fixed 64 bytes) */
export const SMB2_HEADER_SIZE = 64

/** NetBIOS Session Service header size (4 bytes) */
export const NETBIOS_HEADER_SIZE = 4

/**
 * SMB2 Commands
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/fb188936-5050-48d3-b350-dc43059638a4
 */
export enum SMB2Command {
  NEGOTIATE = 0x0000,
  SESSION_SETUP = 0x0001,
  LOGOFF = 0x0002,
  TREE_CONNECT = 0x0003,
  TREE_DISCONNECT = 0x0004,
  CREATE = 0x0005,
  CLOSE = 0x0006,
  FLUSH = 0x0007,
  READ = 0x0008,
  WRITE = 0x0009,
  LOCK = 0x000a,
  IOCTL = 0x000b,
  CANCEL = 0x000c,
  ECHO = 0x000d,
  QUERY_DIRECTORY = 0x000e,
  CHANGE_NOTIFY = 0x000f,
  QUERY_INFO = 0x0010,
  SET_INFO = 0x0011,
  OPLOCK_BREAK = 0x0012,
}

/**
 * SMB2 Dialects
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/bc613d2d-3628-4469-b8bb-40e8f53f2d55
 */
export enum SMB2Dialect {
  SMB_2_0_2 = 0x0202, // Windows Vista SP1, Server 2008
  SMB_2_1 = 0x0210, // Windows 7, Server 2008 R2
  SMB_3_0 = 0x0300, // Windows 8, Server 2012
  SMB_3_0_2 = 0x0302, // Windows 8.1, Server 2012 R2
  SMB_3_1_1 = 0x0311, // Windows 10, Server 2016
}

/**
 * SMB2 Header Flags
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/ea4560b7-90da-4803-82b5-344754b92a79
 */
export enum SMB2Flags {
  SERVER_TO_REDIR = 0x00000001, // Response (server to client)
  ASYNC_COMMAND = 0x00000002, // Asynchronous operation
  RELATED_OPERATIONS = 0x00000004, // Related to previous request
  SIGNED = 0x00000008, // Message is signed
  PRIORITY_MASK = 0x00000070, // Priority mask
  DFS_OPERATIONS = 0x10000000, // DFS operation
  REPLAY_OPERATION = 0x20000000, // Replay operation
}

/**
 * SMB2 Session Flags
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e1ba0c32-1317-48d0-979c-16fe6d728b5d
 */
export enum SMB2SessionFlags {
  IS_GUEST = 0x0001, // Guest session
  IS_NULL = 0x0002, // Null (anonymous) session
  ENCRYPT_DATA = 0x0004, // Session requires encryption
}

/**
 * SMB2 Capabilities
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/bc613d2d-3628-4469-b8bb-40e8f53f2d55
 */
export enum SMB2Capabilities {
  DFS = 0x00000001, // DFS support
  LEASING = 0x00000002, // File leasing
  LARGE_MTU = 0x00000004, // Large MTU
  MULTI_CHANNEL = 0x00000008, // Multi-channel support
  PERSISTENT_HANDLES = 0x00000010, // Persistent handles
  DIRECTORY_LEASING = 0x00000020, // Directory leasing
  ENCRYPTION = 0x00000040, // Encryption support
}

/**
 * SMB2 Security Modes
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e1ba0c32-1317-48d0-979c-16fe6d728b5d
 */
export enum SMB2SecurityMode {
  SIGNING_ENABLED = 0x0001, // Signing enabled
  SIGNING_REQUIRED = 0x0002, // Signing required
}

/**
 * SMB2 Share Types
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export enum SMB2ShareType {
  DISK = 0x01, // Disk share
  PIPE = 0x02, // Named pipe
  PRINT = 0x03, // Printer share
}

/**
 * SMB2 Share Flags
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export enum SMB2ShareFlags {
  MANUAL_CACHING = 0x00000000,
  AUTO_CACHING = 0x00000010,
  VDO_CACHING = 0x00000020,
  NO_CACHING = 0x00000030,
  DFS = 0x00000001, // Share is in DFS
  DFS_ROOT = 0x00000002, // Share is DFS root
  RESTRICT_EXCLUSIVE_OPENS = 0x00000100,
  FORCE_SHARED_DELETE = 0x00000200,
  ALLOW_NAMESPACE_CACHING = 0x00000400,
  ACCESS_BASED_DIRECTORY_ENUM = 0x00000800,
  FORCE_LEVELII_OPLOCK = 0x00001000,
  ENABLE_HASH_V1 = 0x00002000,
  ENABLE_HASH_V2 = 0x00004000,
  ENCRYPT_DATA = 0x00008000,
}

/**
 * SMB2 Share Capabilities
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export enum SMB2ShareCapabilities {
  DFS = 0x00000008, // Share is in DFS
  CONTINUOUS_AVAILABILITY = 0x00000010, // Continuously available
  SCALEOUT = 0x00000020, // Scale-out share
  CLUSTER = 0x00000040, // Clustered share
  ASYMMETRIC = 0x00000080, // Asymmetric share
  REDIRECT_TO_OWNER = 0x00000100,
}

/**
 * NT Status Codes (Common)
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-erref/596a1078-e883-4972-9bbc-49e60bebca55
 */
export enum NTStatus {
  SUCCESS = 0x00000000,
  PENDING = 0x00000103,
  END_OF_FILE = 0xc0000011,
  MORE_PROCESSING_REQUIRED = 0xc0000016,
  ACCESS_DENIED = 0xc0000022,
  OBJECT_NAME_NOT_FOUND = 0xc0000034,
  OBJECT_PATH_NOT_FOUND = 0xc000003a,
  SHARING_VIOLATION = 0xc0000043,
  LOGON_FAILURE = 0xc000006d,
  WRONG_PASSWORD = 0xc000006a,
  PASSWORD_EXPIRED = 0xc0000071,
  ACCOUNT_DISABLED = 0xc0000072,
  INVALID_PARAMETER = 0xc000000d,
  NO_SUCH_FILE = 0xc000000f,
  INVALID_SMB = 0x00010002,
  NOT_SUPPORTED = 0xc00000bb,
  NETWORK_NAME_DELETED = 0xc00000c9,
  USER_SESSION_DELETED = 0xc0000203,
}

/**
 * File Attributes
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/ca28ec38-f155-4768-81d6-4bfeb8586fc9
 */
export enum FileAttributes {
  READONLY = 0x00000001,
  HIDDEN = 0x00000002,
  SYSTEM = 0x00000004,
  DIRECTORY = 0x00000010,
  ARCHIVE = 0x00000020,
  NORMAL = 0x00000080,
  TEMPORARY = 0x00000100,
  SPARSE_FILE = 0x00000200,
  REPARSE_POINT = 0x00000400,
  COMPRESSED = 0x00000800,
  OFFLINE = 0x00001000,
  NOT_CONTENT_INDEXED = 0x00002000,
  ENCRYPTED = 0x00004000,
}

/**
 * Create Disposition
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export enum CreateDisposition {
  SUPERSEDE = 0x00000000, // Replace if exists, create if not
  OPEN = 0x00000001, // Open if exists, fail if not
  CREATE = 0x00000002, // Create if not exists, fail if exists
  OPEN_IF = 0x00000003, // Open if exists, create if not
  OVERWRITE = 0x00000004, // Overwrite if exists, fail if not
  OVERWRITE_IF = 0x00000005, // Overwrite if exists, create if not
}

/**
 * Create Options
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export enum CreateOptions {
  DIRECTORY_FILE = 0x00000001,
  WRITE_THROUGH = 0x00000002,
  SEQUENTIAL_ONLY = 0x00000004,
  NO_INTERMEDIATE_BUFFERING = 0x00000008,
  SYNCHRONOUS_IO_ALERT = 0x00000010,
  SYNCHRONOUS_IO_NONALERT = 0x00000020,
  NON_DIRECTORY_FILE = 0x00000040,
  COMPLETE_IF_OPLOCKED = 0x00000100,
  NO_EA_KNOWLEDGE = 0x00000200,
  RANDOM_ACCESS = 0x00000800,
  DELETE_ON_CLOSE = 0x00001000,
  OPEN_BY_FILE_ID = 0x00002000,
  OPEN_FOR_BACKUP_INTENT = 0x00004000,
  NO_COMPRESSION = 0x00008000,
}

/**
 * Desired Access Flags
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export enum DesiredAccess {
  FILE_READ_DATA = 0x00000001,
  FILE_WRITE_DATA = 0x00000002,
  FILE_APPEND_DATA = 0x00000004,
  FILE_READ_EA = 0x00000008,
  FILE_WRITE_EA = 0x00000010,
  FILE_EXECUTE = 0x00000020,
  FILE_READ_ATTRIBUTES = 0x00000080,
  FILE_WRITE_ATTRIBUTES = 0x00000100,
  DELETE = 0x00010000,
  READ_CONTROL = 0x00020000,
  WRITE_DAC = 0x00040000,
  WRITE_OWNER = 0x00080000,
  SYNCHRONIZE = 0x00100000,
  ACCESS_SYSTEM_SECURITY = 0x01000000,
  MAXIMUM_ALLOWED = 0x02000000,
  GENERIC_ALL = 0x10000000,
  GENERIC_EXECUTE = 0x20000000,
  GENERIC_WRITE = 0x40000000,
  GENERIC_READ = 0x80000000,
}

/**
 * Share Access Flags
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-smb2/e8fb45c1-a03d-44ca-b7ae-47385cfd7997
 */
export enum ShareAccess {
  NONE = 0x00000000,
  READ = 0x00000001,
  WRITE = 0x00000002,
  DELETE = 0x00000004,
}

/**
 * File Information Class
 * https://learn.microsoft.com/en-us/openspecs/windows_protocols/ms-fscc/4718fc40-e539-4014-8e33-b675af74e3e1
 */
export enum FileInformationClass {
  FileDirectoryInformation = 1,
  FileFullDirectoryInformation = 2,
  FileBothDirectoryInformation = 3,
  FileBasicInformation = 4,
  FileStandardInformation = 5,
  FileInternalInformation = 6,
  FileEaInformation = 7,
  FileAccessInformation = 8,
  FileNameInformation = 9,
  FileRenameInformation = 10,
  FileLinkInformation = 11,
  FileNamesInformation = 12,
  FileDispositionInformation = 13,
  FilePositionInformation = 14,
  FileFullEaInformation = 15,
  FileModeInformation = 16,
  FileAlignmentInformation = 17,
  FileAllInformation = 18,
  FileAllocationInformation = 19,
  FileEndOfFileInformation = 20,
  FileAlternateNameInformation = 21,
  FileStreamInformation = 22,
  FilePipeInformation = 23,
  FilePipeLocalInformation = 24,
  FilePipeRemoteInformation = 25,
  FileMailslotQueryInformation = 26,
  FileMailslotSetInformation = 27,
  FileCompressionInformation = 28,
  FileObjectIdInformation = 29,
  FileCompletionInformation = 30,
  FileMoveClusterInformation = 31,
  FileQuotaInformation = 32,
  FileReparsePointInformation = 33,
  FileNetworkOpenInformation = 34,
  FileAttributeTagInformation = 35,
  FileTrackingInformation = 36,
  FileIdBothDirectoryInformation = 37,
  FileIdFullDirectoryInformation = 38,
  FileValidDataLengthInformation = 39,
  FileShortNameInformation = 40,
}
