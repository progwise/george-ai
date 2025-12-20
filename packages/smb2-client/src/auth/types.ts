/**
 * NTLM Authentication Types
 *
 * Type definitions for NTLM protocol structures
 */

/**
 * NTLM Message Types
 */
export enum NTLMMessageType {
  /** Type 1: Negotiate */
  NEGOTIATE = 1,
  /** Type 2: Challenge */
  CHALLENGE = 2,
  /** Type 3: Authenticate */
  AUTHENTICATE = 3,
}

/**
 * NTLM Negotiate Flags
 * https://docs.microsoft.com/en-us/openspecs/windows_protocols/ms-nlmp/99d90ff4-957f-4c8a-80e4-5bfe5a9a9832
 */
export enum NTLMFlags {
  /** Request Unicode strings */
  NEGOTIATE_UNICODE = 0x00000001,
  /** Request OEM strings */
  NEGOTIATE_OEM = 0x00000002,
  /** Request target name */
  REQUEST_TARGET = 0x00000004,
  /** Negotiate signing */
  NEGOTIATE_SIGN = 0x00000010,
  /** Negotiate sealing */
  NEGOTIATE_SEAL = 0x00000020,
  /** Use datagram */
  NEGOTIATE_DATAGRAM = 0x00000040,
  /** Use LAN Manager session key */
  NEGOTIATE_LM_KEY = 0x00000080,
  /** Negotiate NTLM */
  NEGOTIATE_NTLM = 0x00000200,
  /** Negotiate domain */
  NEGOTIATE_DOMAIN = 0x00001000,
  /** Negotiate workstation */
  NEGOTIATE_WORKSTATION = 0x00002000,
  /** Negotiate local call */
  NEGOTIATE_LOCAL_CALL = 0x00004000,
  /** Negotiate always sign */
  NEGOTIATE_ALWAYS_SIGN = 0x00008000,
  /** Target type domain */
  TARGET_TYPE_DOMAIN = 0x00010000,
  /** Target type server */
  TARGET_TYPE_SERVER = 0x00020000,
  /** Negotiate extended security */
  NEGOTIATE_EXTENDED_SECURITY = 0x00080000,
  /** Negotiate identify */
  NEGOTIATE_IDENTIFY = 0x00100000,
  /** Request non-NT session key */
  REQUEST_NON_NT_SESSION_KEY = 0x00400000,
  /** Negotiate target info */
  NEGOTIATE_TARGET_INFO = 0x00800000,
  /** Negotiate version */
  NEGOTIATE_VERSION = 0x02000000,
  /** Negotiate 128-bit encryption */
  NEGOTIATE_128 = 0x20000000,
  /** Negotiate key exchange */
  NEGOTIATE_KEY_EXCH = 0x40000000,
  /** Negotiate 56-bit encryption */
  NEGOTIATE_56 = 0x80000000,
}

/**
 * AV_PAIR types (Target Info)
 */
export enum AVPairType {
  /** End of list */
  EOL = 0x0000,
  /** Server NetBIOS computer name */
  NB_COMPUTER_NAME = 0x0001,
  /** Server NetBIOS domain name */
  NB_DOMAIN_NAME = 0x0002,
  /** Server DNS computer name */
  DNS_COMPUTER_NAME = 0x0003,
  /** Server DNS domain name */
  DNS_DOMAIN_NAME = 0x0004,
  /** Server DNS tree name */
  DNS_TREE_NAME = 0x0005,
  /** Flags */
  FLAGS = 0x0006,
  /** Timestamp */
  TIMESTAMP = 0x0007,
  /** Single host data */
  SINGLE_HOST = 0x0008,
  /** Target name */
  TARGET_NAME = 0x0009,
  /** Channel bindings */
  CHANNEL_BINDINGS = 0x000a,
}

/**
 * NTLM Type 2 Challenge Message
 */
export interface NTLMChallenge {
  /** Server challenge (8 bytes) */
  challenge: Buffer
  /** Negotiate flags */
  flags: number
  /** Target name (domain/server) */
  targetName?: string
  /** Target info blob */
  targetInfo?: Buffer
  /** Server version info */
  version?: Buffer
}

/**
 * NTLM Credentials
 */
export interface NTLMCredentials {
  /** Domain name */
  domain: string
  /** Username */
  username: string
  /** Password */
  password: string
  /** Workstation name */
  workstation: string
}

/**
 * AV_PAIR structure
 */
export interface AVPair {
  /** AV_PAIR type */
  type: AVPairType
  /** Value length */
  length: number
  /** Value */
  value: Buffer
}
