import { exec } from 'child_process'
import fs from 'node:fs'
import path from 'node:path'
import { promisify } from 'util'

const execAsync = promisify(exec)

const MOUNT_BASE_DIR = path.resolve('./.smb-mounts')
const CREDENTIALS_DIR = path.resolve('./.smb-credentials')

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

function getCredentialsFile(crawlerId: string): string {
  return path.join(CREDENTIALS_DIR, `${crawlerId}.creds`)
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

async function ensureDirectoryExists(dirPath: string, mode?: number): Promise<void> {
  try {
    await fs.promises.mkdir(dirPath, { recursive: true, mode })
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error
    }
  }
}

async function storeCredentials(crawlerId: string, username: string, password: string): Promise<string> {
  // Ensure credentials directory exists with restricted permissions
  await ensureDirectoryExists(CREDENTIALS_DIR, 0o700)

  const credFile = getCredentialsFile(crawlerId)
  const content = `username=${username}\npassword=${password}\n`

  // Write credentials file with owner-only permissions
  await fs.promises.writeFile(credFile, content, { mode: 0o600 })

  return credFile
}

async function removeCredentials(crawlerId: string): Promise<void> {
  const credFile = getCredentialsFile(crawlerId)
  try {
    await fs.promises.unlink(credFile)
    console.log(`Removed credentials file for crawler ${crawlerId}`)
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      console.warn(`Failed to remove credentials file for crawler ${crawlerId}:`, error)
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
  console.log('ensureCrawlerSmbShare', { crawlerId, uri, username: '***' })

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

    // Store credentials securely
    const credFile = await storeCredentials(crawlerId, username, password)

    try {
      // Mount the SMB share using credentials file
      const mountCmd = [
        'sudo',
        'mount',
        '-t',
        'cifs',
        smbPath,
        mountPoint,
        '-o',
        `credentials=${credFile},uid=$(id -u),gid=$(id -g),iocharset=utf8,file_mode=0644,dir_mode=0755`,
      ].join(' ')

      console.log(`Mounting SMB share: ${smbPath} -> ${mountPoint}`)
      await execAsync(mountCmd)
    } catch (mountError) {
      // Clean up credentials file if mount fails
      await removeCredentials(crawlerId)
      throw mountError
    }

    // Verify mount was successful
    if (!(await isMounted(mountPoint))) {
      throw new Error('Mount command succeeded but share is not mounted')
    }

    console.log(`Successfully mounted SMB share at ${mountPoint}`)
    return mountPoint
  } catch (error) {
    console.error(`Error mounting SMB share for crawler ${crawlerId}:`, error)

    // Clean up mount point and credentials if mount failed
    try {
      await fs.promises.rmdir(mountPoint)
    } catch (cleanupError) {
      console.warn('Failed to cleanup mount point after failed mount:', cleanupError)
    }

    await removeCredentials(crawlerId)

    throw new Error(`Failed to mount SMB share: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Update SMB mount with new credentials
 * This handles the case where credentials are changed for an existing mount
 */
export const updateCrawlerSmbMount = async (params: {
  crawlerId: string
  uri: string
  username: string
  password: string
}): Promise<string> => {
  const { crawlerId, uri, username, password } = params
  console.log('updateCrawlerSmbMount', { crawlerId, uri, username: '***' })

  const mountPoint = getMountPoint(crawlerId)

  try {
    // Check if mounted and unmount first (but don't remove credentials yet)
    if (await isMounted(mountPoint)) {
      console.log(`Unmounting existing SMB share at ${mountPoint}`)
      await execAsync(`sudo umount ${mountPoint}`)

      // Wait for unmount to complete
      let retries = 5
      while (retries > 0 && (await isMounted(mountPoint))) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        retries--
      }
    }

    // Update credentials (this will overwrite existing ones)
    await storeCredentials(crawlerId, username, password)

    // Now mount with new credentials
    const { server, share } = parseUri(uri)
    const smbPath = `//${server}/${share}`
    const credFile = getCredentialsFile(crawlerId)

    // Ensure mount point directory exists
    await ensureDirectoryExists(mountPoint)

    const mountCmd = [
      'sudo',
      'mount',
      '-t',
      'cifs',
      smbPath,
      mountPoint,
      '-o',
      `credentials=${credFile},uid=$(id -u),gid=$(id -g),iocharset=utf8,file_mode=0644,dir_mode=0755`,
    ].join(' ')

    console.log(`Mounting SMB share with updated credentials: ${smbPath} -> ${mountPoint}`)
    await execAsync(mountCmd)

    // Verify mount was successful
    if (!(await isMounted(mountPoint))) {
      throw new Error('Mount command succeeded but share is not mounted')
    }

    console.log(`Successfully updated SMB mount for crawler ${crawlerId}`)
    return mountPoint
  } catch (error) {
    console.error(`Error updating SMB mount for crawler ${crawlerId}:`, error)
    throw new Error(`Failed to update SMB mount: ${error instanceof Error ? error.message : String(error)}`)
  }
}

export const ensureCrawlerSmbShareUnmount = async (params: { crawlerId: string }): Promise<void> => {
  const { crawlerId } = params
  console.log('unmountSmbShare', { crawlerId })

  const mountPoint = getMountPoint(crawlerId)

  try {
    // Check if mounted
    if (!(await isMounted(mountPoint))) {
      console.log(`No SMB share mount to clean up for crawler ${crawlerId}`)

      // Clean up mount point directory if it exists and is empty
      const dirExists = await fs.promises
        .access(mountPoint, fs.constants.F_OK)
        .then(() => true)
        .catch(() => false)

      if (dirExists) {
        const files = await fs.promises.readdir(mountPoint)
        if (files.length === 0) {
          await fs.promises.rmdir(mountPoint)
          console.log(`Cleaned up empty mount point directory ${mountPoint}`)
        } else {
          console.log(`Mount point directory ${mountPoint} is not empty, leaving it in place`)
        }
      } else {
        console.log(`Mount point directory ${mountPoint} does not exist, nothing to clean up`)
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

    // Clean up mount point directory and credentials
    try {
      await fs.promises.rmdir(mountPoint)
      console.log(`Cleaned up mount point directory ${mountPoint}`)
    } catch (error) {
      console.warn(`Failed to remove mount point directory ${mountPoint}:`, error)
    }

    // Remove stored credentials
    await removeCredentials(crawlerId)

    console.log(`Successfully unmounted SMB share for crawler ${crawlerId}`)
  } catch (error) {
    console.error(`Error unmounting SMB share for crawler ${crawlerId}:`, error)
    throw new Error(`Failed to unmount SMB share: ${error instanceof Error ? error.message : String(error)}`)
  }
}
