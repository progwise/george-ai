/**
 * SMB Mount Manager
 *
 * Handles mounting and unmounting SMB shares
 * This service runs as root, so it can perform mount operations
 */
import { exec } from 'child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'util'

import type { MountOptions, MountResult, UnmountResult } from './types'

const execAsync = promisify(exec)

const MOUNT_BASE_DIR = process.env.SMB_MOUNT_DIR || path.resolve('./.smb-mounts')
const CREDENTIALS_DIR = process.env.SMB_CREDENTIALS_DIR || path.resolve('./.smb-credentials')

/**
 * Ensure a directory exists
 */
async function ensureDirectoryExists(dirPath: string, mode?: number): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true, mode })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

/**
 * Check if a path is currently mounted
 */
async function isMounted(mountPoint: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync('mount')
    return stdout.includes(mountPoint)
  } catch (error) {
    console.warn('Error checking mount status:', error)
    return false
  }
}

/**
 * Parse SMB URI into components
 */
function parseUri(uri: string): { server: string; share: string; path?: string } {
  // Handle both smb://server/share/path and //server/share/path formats
  const cleanUri = uri.replace(/^smb:/, '')
  const match = cleanUri.match(/^\/\/([^/]+)\/([^/]+)(?:\/(.*))?$/)

  if (!match) {
    throw new Error(`Invalid SMB URI format: ${uri}`)
  }

  return {
    server: match[1],
    share: match[2],
    path: match[3] || '',
  }
}

/**
 * Initialize mount and credentials directories
 */
export async function initializeMountManager(): Promise<void> {
  await ensureDirectoryExists(MOUNT_BASE_DIR)
  await ensureDirectoryExists(CREDENTIALS_DIR, 0o700)
  console.log('[MountManager] Initialized')
  console.log(`[MountManager] Mount base: ${MOUNT_BASE_DIR}`)
  console.log(`[MountManager] Credentials: ${CREDENTIALS_DIR}`)
}

/**
 * Mount an SMB share
 */
export async function mountShare(options: MountOptions): Promise<MountResult> {
  const { crawlerId, uri, username, password } = options

  const mountPoint = path.join(MOUNT_BASE_DIR, crawlerId)
  const credFile = path.join(CREDENTIALS_DIR, `${crawlerId}.creds`)

  console.log(`[Mount] Request for crawler ${crawlerId}: ${uri}`)

  try {
    // Check if already mounted
    if (await isMounted(mountPoint)) {
      console.log(`[Mount] Already mounted: ${mountPoint}`)
      return { success: true, mountPoint, alreadyMounted: true }
    }

    // Parse URI
    const { server, share } = parseUri(uri)
    const smbPath = `//${server}/${share}`

    // Ensure mount point exists
    await ensureDirectoryExists(mountPoint)

    // Store credentials securely
    const credContent = `username=${username}\npassword=${password}\n`
    await fs.promises.writeFile(credFile, credContent, { mode: 0o600 })

    // Mount the share
    // - uid=$(id -u),gid=$(id -g): Files appear owned by the current user (dynamic)
    // - iocharset=utf8: Support Unicode filenames
    // - file_mode/dir_mode: Set appropriate permissions
    const mountCmd = `sudo mount -t cifs ${smbPath} ${mountPoint} -o credentials=${credFile},uid=$(id -u),gid=$(id -g),iocharset=utf8,file_mode=0644,dir_mode=0755`

    console.log(
      `[Mount] Executing: sudo mount -t cifs ${smbPath} ${mountPoint} -o credentials=***,uid=$(id -u),gid=$(id -g),iocharset=utf8,file_mode=0644,dir_mode=0755`,
    )
    await execAsync(mountCmd)

    // Verify mount succeeded
    if (!(await isMounted(mountPoint))) {
      throw new Error('Mount command succeeded but share is not mounted')
    }

    console.log(`[Mount] Success: ${mountPoint}`)
    return { success: true, mountPoint }
  } catch (error) {
    console.error('[Mount] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * Unmount an SMB share
 */
export async function unmountShare(crawlerId: string): Promise<UnmountResult> {
  const mountPoint = path.join(MOUNT_BASE_DIR, crawlerId)
  const credFile = path.join(CREDENTIALS_DIR, `${crawlerId}.creds`)

  console.log(`[Unmount] Request for crawler ${crawlerId}`)

  try {
    // Check if mounted
    if (!(await isMounted(mountPoint))) {
      console.log(`[Unmount] Not mounted: ${mountPoint}`)

      // Clean up mount point if it exists
      try {
        const files = await fs.promises.readdir(mountPoint)
        if (files.length === 0) {
          await fs.promises.rmdir(mountPoint)
          console.log(`[Unmount] Cleaned up empty mount point: ${mountPoint}`)
        }
      } catch {
        // Directory doesn't exist, ignore
      }

      // Clean up credentials
      try {
        await fs.promises.unlink(credFile)
        console.log(`[Unmount] Cleaned up credentials: ${credFile}`)
      } catch {
        // File doesn't exist, ignore
      }

      return { success: true, alreadyUnmounted: true }
    }

    // Unmount
    console.log(`[Unmount] Executing: sudo umount ${mountPoint}`)
    await execAsync(`sudo umount ${mountPoint}`)

    // Wait for unmount to complete
    let retries = 5
    while (retries > 0 && (await isMounted(mountPoint))) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      retries--
    }

    // Force unmount if still mounted
    if (await isMounted(mountPoint)) {
      console.warn(`[Unmount] Force unmounting: ${mountPoint}`)
      await execAsync(`sudo umount -f ${mountPoint}`)
    }

    // Clean up mount point
    try {
      await fs.promises.rmdir(mountPoint)
      console.log(`[Unmount] Cleaned up mount point: ${mountPoint}`)
    } catch (error) {
      console.warn(`[Unmount] Failed to remove mount point: ${error}`)
    }

    // Clean up credentials
    try {
      await fs.promises.unlink(credFile)
      console.log(`[Unmount] Cleaned up credentials: ${credFile}`)
    } catch (error) {
      console.warn(`[Unmount] Failed to remove credentials: ${error}`)
    }

    console.log(`[Unmount] Success: ${crawlerId}`)
    return { success: true }
  } catch (error) {
    console.error('[Unmount] Error:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

/**
 * List all currently mounted shares
 */
export async function listMounts(): Promise<Array<{ share: string; mountPoint: string }>> {
  try {
    const { stdout } = await execAsync('mount')
    const lines = stdout.split('\n')
    const smbMounts = lines
      .filter((line) => line.includes(MOUNT_BASE_DIR))
      .map((line) => {
        const match = line.match(/\/\/([^ ]+) on ([^ ]+)/)
        return match ? { share: match[1], mountPoint: match[2] } : null
      })
      .filter((mount): mount is { share: string; mountPoint: string } => mount !== null)

    return smbMounts
  } catch (error) {
    console.error('[List] Error:', error)
    return []
  }
}

/**
 * Get mount point for a crawler ID
 */
export function getMountPoint(crawlerId: string): string {
  return path.join(MOUNT_BASE_DIR, crawlerId)
}
