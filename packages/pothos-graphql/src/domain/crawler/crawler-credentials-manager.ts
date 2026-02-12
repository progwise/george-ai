import fs from 'node:fs'
import path from 'node:path'

import config from '../../config'
import { logger } from './common'

const CREDENTIALS_DIR = path.resolve(config('CRAWLER_CREDENTIALS_DIR'))

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
  logger.info('Crawler credentials stored for crawler', { crawlerId })

  return credFile
}

export async function getCrawlerCredentials(crawlerId: string): Promise<Record<string, string | null>> {
  const credFile = getCredentialsFile(crawlerId)

  try {
    const fileContent = await fs.promises.readFile(credFile, 'utf-8')
    return JSON.parse(fileContent)
  } catch {
    logger.warn('No Crawler credentials found for crawler', { crawlerId })
    return {}
  }
}

export async function removeCrawlerCredentials(crawlerId: string): Promise<void> {
  const credFile = getCredentialsFile(crawlerId)

  try {
    await fs.promises.unlink(credFile)
    logger.info('Crawler credentials removed for crawler', { crawlerId })
  } catch (error) {
    logger.warn('Failed to remove Crawler credentials for crawler', { crawlerId, error })
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
