import { logger } from '../common'

// Reuse the parsing function from crawl-sharepoint.ts
export function parseSharePointUrl(uri: string) {
  logger.info('Parsing Sharepoint URI', { uri })
  try {
    const cleanUri = uri.endsWith('/') ? uri.slice(0, -1) : uri
    const fullUrl = new URL(cleanUri)
    const pathParts = fullUrl.pathname.split('/').filter((part) => part.length > 0)
    // For downloading files, we need the base SharePoint site URL (without library path)
    const siteUrl = new URL(`${fullUrl.protocol}//${fullUrl.host}`)
    const apiUrl = new URL(`${fullUrl.protocol}//${fullUrl.host}/_api`)
    const libName = pathParts[pathParts.length - 1]
    const siteName = pathParts.slice(0, -1).join('/')
    logger.info('Parsed SharePoint URL components', {
      siteUrl: siteUrl.toString(),
      apiUrl: apiUrl.toString(),
      libName,
      siteName,
    })
    return { siteUrl, apiUrl, siteName, libName }
  } catch (error) {
    logger.error('Error parsing SharePoint URL', { uri, error })
    throw error
  }
}
