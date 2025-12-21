/**
 * SMB2 Tree Manager
 *
 * Manages SMB2 tree connections (TREE_CONNECT to shares)
 */
import { createTreeConnectRequest } from '../protocol/commands/tree-connect'
import type { SMB2Connection } from '../protocol/connection'

export interface TreeConnection {
  sharePath: string
  treeId: number
  connectedAt: Date
}

export class TreeManager {
  private trees: Map<string, TreeConnection> = new Map()

  constructor(
    private connection: SMB2Connection,
    private sessionId: bigint,
  ) {}

  /**
   * Connect to a share
   */
  async connect(sharePath: string): Promise<number> {
    // Check if already connected
    const existing = this.trees.get(sharePath)
    if (existing) {
      return existing.treeId
    }

    // Connect to share
    const treeConnectRequest = createTreeConnectRequest(sharePath, this.sessionId)
    const treeConnectResponse = await this.connection.sendMessage(treeConnectRequest)

    if (!treeConnectResponse.isSuccess()) {
      throw new Error(`TREE_CONNECT failed: ${treeConnectResponse.getStatusString()}`)
    }

    const treeId = treeConnectResponse.header.treeId

    // Store tree connection
    this.trees.set(sharePath, {
      sharePath,
      treeId,
      connectedAt: new Date(),
    })

    return treeId
  }

  /**
   * Get tree ID for a share path
   */
  getTreeId(sharePath: string): number {
    const tree = this.trees.get(sharePath)
    if (!tree) {
      throw new Error(`Not connected to share: ${sharePath}`)
    }
    return tree.treeId
  }

  /**
   * Check if connected to a share
   */
  isConnected(sharePath: string): boolean {
    return this.trees.has(sharePath)
  }

  /**
   * Get all connected trees
   */
  getConnectedTrees(): TreeConnection[] {
    return Array.from(this.trees.values())
  }

  /**
   * Disconnect from a share
   */
  disconnect(sharePath: string): void {
    this.trees.delete(sharePath)
  }

  /**
   * Disconnect from all shares
   */
  disconnectAll(): void {
    this.trees.clear()
  }
}
