import fs from 'node:fs'
import path from 'node:path'

const CREDENTIALS_DIR = path.resolve('./.sharepoint-credentials')

async function ensureDirectoryExists(dirPath: string, mode: number = 0o755): Promise<void> {
  try {
    await fs.promises.access(dirPath)
  } catch {
    await fs.promises.mkdir(dirPath, { mode, recursive: true })
  }
}

function getCredentialsFile(crawlerId: string): string {
  return path.join(CREDENTIALS_DIR, `${crawlerId}.txt`)
}

export async function storeSharePointCredentials(crawlerId: string, authCookies: string): Promise<string> {
  await ensureDirectoryExists(CREDENTIALS_DIR, 0o700)
  const credFile = getCredentialsFile(crawlerId)
  
  // Store the cookies in a simple text file
  await fs.promises.writeFile(credFile, authCookies, { mode: 0o600 })
  console.log(`SharePoint credentials stored for crawler ${crawlerId}`)
  
  return credFile
}

export async function getSharePointCredentials(crawlerId: string): Promise<string | null> {
  const credFile = getCredentialsFile(crawlerId)
  
  try {
    const authCookies = await fs.promises.readFile(credFile, 'utf-8')
    return authCookies.trim()
  } catch {
    console.warn(`No SharePoint credentials found for crawler ${crawlerId}`)
    return null
  }
}

export async function removeSharePointCredentials(crawlerId: string): Promise<void> {
  const credFile = getCredentialsFile(crawlerId)
  
  try {
    await fs.promises.unlink(credFile)
    console.log(`SharePoint credentials removed for crawler ${crawlerId}`)
  } catch (error) {
    console.warn(`Failed to remove SharePoint credentials for crawler ${crawlerId}:`, error)
  }
}

export async function updateCrawlerSharePointCredentials(
  crawlerId: string,
  authCookies: string | null
): Promise<void> {
  if (!authCookies) {
    await removeSharePointCredentials(crawlerId)
    return
  }

  await storeSharePointCredentials(crawlerId, authCookies)
}