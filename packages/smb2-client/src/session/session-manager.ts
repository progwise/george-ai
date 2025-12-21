/**
 * SMB2 Session Manager
 *
 * Manages SMB2 session lifecycle (NEGOTIATE + SESSION_SETUP)
 */
import { createNegotiateRequest } from '../protocol/commands/negotiate'
import {
  createSessionSetupRequest1,
  createSessionSetupRequest3,
  parseSessionSetupResponse,
} from '../protocol/commands/session-setup'
import type { SMB2Connection } from '../protocol/connection'

export interface SessionCredentials {
  domain: string
  username: string
  password: string
  workstation: string
}

export enum SessionState {
  NOT_AUTHENTICATED = 'NOT_AUTHENTICATED',
  AUTHENTICATING = 'AUTHENTICATING',
  AUTHENTICATED = 'AUTHENTICATED',
  EXPIRED = 'EXPIRED',
}

export class SessionManager {
  private sessionId: bigint = 0n
  private state: SessionState = SessionState.NOT_AUTHENTICATED

  constructor(
    private connection: SMB2Connection,
    private credentials: SessionCredentials,
  ) {}

  /**
   * Authenticate with the SMB server (NEGOTIATE + SESSION_SETUP)
   */
  async authenticate(): Promise<bigint> {
    if (this.state === SessionState.AUTHENTICATED) {
      return this.sessionId
    }

    this.state = SessionState.AUTHENTICATING

    try {
      // Step 1: NEGOTIATE
      const negotiateRequest = createNegotiateRequest()
      const negotiateResponse = await this.connection.sendMessage(negotiateRequest)

      if (!negotiateResponse.isSuccess()) {
        throw new Error(`NEGOTIATE failed: ${negotiateResponse.getStatusString()}`)
      }

      // Step 2: SESSION_SETUP Type 1 (NTLM NEGOTIATE)
      const sessionSetupRequest1 = createSessionSetupRequest1()
      const sessionSetupResponse1 = await this.connection.sendMessage(sessionSetupRequest1)

      if (!sessionSetupResponse1.isMoreProcessingRequired()) {
        throw new Error(`SESSION_SETUP Type 1 failed: ${sessionSetupResponse1.getStatusString()}`)
      }

      const sessionSetupData1 = parseSessionSetupResponse(sessionSetupResponse1)

      // Step 3: SESSION_SETUP Type 3 (NTLM AUTHENTICATE)
      const sessionSetupRequest3 = createSessionSetupRequest3(
        {
          domain: this.credentials.domain,
          username: this.credentials.username,
          password: this.credentials.password,
          workstation: this.credentials.workstation,
        },
        sessionSetupData1,
      )

      // Use session ID from Type 2 response
      sessionSetupRequest3.header.sessionId = sessionSetupResponse1.header.sessionId

      const sessionSetupResponse3 = await this.connection.sendMessage(sessionSetupRequest3)

      if (!sessionSetupResponse3.isSuccess()) {
        throw new Error(`SESSION_SETUP Type 3 failed: ${sessionSetupResponse3.getStatusString()}`)
      }

      // Store session ID
      this.sessionId = sessionSetupResponse3.header.sessionId
      this.state = SessionState.AUTHENTICATED

      return this.sessionId
    } catch (error) {
      this.state = SessionState.NOT_AUTHENTICATED
      throw error
    }
  }

  /**
   * Get current session ID
   */
  getSessionId(): bigint {
    if (this.state !== SessionState.AUTHENTICATED) {
      throw new Error('Not authenticated')
    }
    return this.sessionId
  }

  /**
   * Get current session state
   */
  getState(): SessionState {
    return this.state
  }

  /**
   * Check if authenticated
   */
  isAuthenticated(): boolean {
    return this.state === SessionState.AUTHENTICATED
  }

  /**
   * Invalidate session
   */
  invalidate(): void {
    this.sessionId = 0n
    this.state = SessionState.EXPIRED
  }
}
