import fs from 'node:fs'
import path from 'node:path'

const CREDENTIALS_DIR = path.resolve('./.crawler-credentials')

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

export async function storeCrawlerCredentials(
  crawlerId: string,
  values: Record<string, string | null>,
): Promise<string> {
  await ensureDirectoryExists(CREDENTIALS_DIR, 0o700)
  const credFile = getCredentialsFile(crawlerId)

  // Store the cookies in a simple text file
  await fs.promises.writeFile(credFile, JSON.stringify(values, null, 2), { mode: 0o600 })
  console.log(`Crawler credentials stored for crawler ${crawlerId}`)

  return credFile
}

export async function getCrawlerCredentials(crawlerId: string): Promise<Record<string, string | null>> {
  const credFile = getCredentialsFile(crawlerId)

  try {
    const fileContent = await fs.promises.readFile(credFile, 'utf-8')
    return JSON.parse(fileContent)
  } catch {
    console.warn(`No Crawler credentials found for crawler ${crawlerId}`)
    return {}
  }
}

export async function removeCrawlerCredentials(crawlerId: string): Promise<void> {
  const credFile = getCredentialsFile(crawlerId)

  try {
    await fs.promises.unlink(credFile)
    console.log(`Crawler credentials removed for crawler ${crawlerId}`)
  } catch (error) {
    console.warn(`Failed to remove Crawler credentials for crawler ${crawlerId}:`, error)
  }
}

export async function updateCrawlerCredentials(
  crawlerId: string,
  values: Record<string, string | null> | null,
): Promise<void> {
  if (!values) {
    await removeCrawlerCredentials(crawlerId)
    return
  }

  await storeCrawlerCredentials(crawlerId, values)
}
