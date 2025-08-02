import { exec } from 'child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'util'

const execAsync = promisify(exec)

const MOUNT_BASE_DIR = './.smb-mounts'

interface SmbUri {
  server: string
  share: string
  path?: string
}

function parseUri(uri: string): SmbUri {
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

export function uriToMountedPath(uri: string, crawlerId: string): string {
  const mountPoint = path.join(MOUNT_BASE_DIR, crawlerId)
  const { path: smbPath } = parseUri(uri)
  if (!smbPath) {
    return path.join(mountPoint, '/')
  }
  return path.join(mountPoint, smbPath)
}

function getMountPoint(crawlerId: string): string {
  return path.join(MOUNT_BASE_DIR, crawlerId)
}

async function isMounted(mountPoint: string): Promise<boolean> {
  try {
    const { stdout } = await execAsync('mount')
    return stdout.includes(mountPoint)
  } catch (error) {
    console.warn('Error checking mount status:', error)
    return false
  }
}

async function ensureDirectoryExists(dirPath: string): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

export const ensureCrawlerSmbShareMount = async (params: {
  crawlerId: string
  uri: string
  username: string
  password: string
}): Promise<string> => {
  const { crawlerId, uri, username, password } = params
  console.log('ensureCrawlerSmbShare', { crawlerId, uri, username })

  const mountPoint = getMountPoint(crawlerId)

  try {
    // Check if already mounted
    if (await isMounted(mountPoint)) {
      console.log(`SMB share already mounted at ${mountPoint}`)
      return mountPoint
    }

    // Parse the URI
    const { server, share } = parseUri(uri)
    const smbPath = `//${server}/${share}`

    // Ensure mount point directory exists
    await ensureDirectoryExists(mountPoint)

    // Mount the SMB share
    const mountCmd = [
      'sudo',
      'mount',
      '-t',
      'cifs',
      smbPath,
      mountPoint,
      '-o',
      `username=${username},password=${password},uid=$(id -u),gid=$(id -g),iocharset=utf8,file_mode=0644,dir_mode=0755`,
    ].join(' ')

    console.log(`Mounting SMB share: ${smbPath} -> ${mountPoint}`)
    await execAsync(mountCmd)

    // Verify mount was successful
    if (!(await isMounted(mountPoint))) {
      throw new Error('Mount command succeeded but share is not mounted')
    }

    console.log(`Successfully mounted SMB share at ${mountPoint}`)
    return mountPoint
  } catch (error) {
    console.error(`Error mounting SMB share for crawler ${crawlerId}:`, error)

    // Clean up mount point if mount failed
    try {
      await fs.promises.rmdir(mountPoint)
    } catch (cleanupError) {
      console.warn('Failed to cleanup mount point after failed mount:', cleanupError)
    }

    throw new Error(`Failed to mount SMB share: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const ensureCrawlerSmbShareUnmount = async (params: { crawlerId: string }): Promise<void> => {
  const { crawlerId } = params
  console.log('unmountSmbShare', { crawlerId })

  const mountPoint = getMountPoint(crawlerId)

  try {
    // Check if mounted
    if (!(await isMounted(mountPoint))) {
      console.log(`SMB share not mounted for crawler ${crawlerId}`)

      // Clean up mount point directory if it exists
      try {
        await fs.promises.rmdir(mountPoint)
        console.log(`Cleaned up mount point directory ${mountPoint}`)
      } catch (error) {
        // Directory might not exist or might not be empty, that's okay
        console.debug('Mount point cleanup not needed:', error)
      }

      return
    }

    // Unmount the share
    console.log(`Unmounting SMB share at ${mountPoint}`)
    await execAsync(`sudo umount ${mountPoint}`)

    // Wait for unmount to complete
    let retries = 5
    while (retries > 0 && (await isMounted(mountPoint))) {
      await new Promise((resolve) => setTimeout(resolve, 100))
      retries--
    }

    if (await isMounted(mountPoint)) {
      console.warn(`SMB share still mounted after unmount command at ${mountPoint}`)
      // Force unmount as last resort
      await execAsync(`sudo umount -f ${mountPoint}`)
    }

    // Clean up mount point directory
    try {
      await fs.promises.rmdir(mountPoint)
      console.log(`Cleaned up mount point directory ${mountPoint}`)
    } catch (error) {
      console.warn(`Failed to remove mount point directory ${mountPoint}:`, error)
    }

    console.log(`Successfully unmounted SMB share for crawler ${crawlerId}`)
  } catch (error) {
    console.error(`Error unmounting SMB share for crawler ${crawlerId}:`, error)
    throw new Error(`Failed to unmount SMB share: ${error instanceof Error ? error.message : String(error)}`)
  }
}
