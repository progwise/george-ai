import { parseSharePointUrl } from './parse-sharepoint-url'
import { discoverSharePointSiteContent } from './sharepoint-discovery'

/**
 * Validates SharePoint connection by checking if the document library exists
 * This runs on the backend where the actual crawling happens
 */
export async function validateSharePointConnection(
  uri: string,
  sharepointAuth: string,
): Promise<{ success: boolean; errorType?: string }> {
  try {
    // Parse the SharePoint URL using the same logic as the crawler
    const { siteUrl, apiUrl, libName } = parseSharePointUrl(uri)

    console.log(`Validating SharePoint connection to: ${uri}`)
    console.log(`Site URL: ${siteUrl}`)
    console.log(`Library to validate: ${libName}`)

    // Use the existing discovery function to get site info and lists
    const discoveryResult = await discoverSharePointSiteContent(apiUrl, sharepointAuth)

    console.log(`Site access confirmed: ${discoveryResult.siteInfo?.title || 'Unknown'}`)

    // If no specific library was specified, just check site access
    if (!libName || libName === '') {
      console.log(`No specific library specified, site access is sufficient`)
      return { success: true }
    }

    // Check if the specified library exists (match by title)
    const libraryExists = discoveryResult.lists.some((list) => {
      const listTitle = list.title?.toLowerCase()
      const libNameLower = libName?.toLowerCase()
      const libNameDecoded = decodeURIComponent(libName).toLowerCase()

      // Check title match (handle both encoded and decoded names)
      const titleMatch = listTitle === libNameLower || listTitle === libNameDecoded

      if (titleMatch) {
        console.log(`Found matching ${list.baseTemplateDescription}: ${list.title}`)
        return true
      }
      return false
    })

    if (libraryExists) {
      console.log(`SharePoint library '${libName}' found and accessible`)
      return { success: true }
    } else {
      console.log(`SharePoint library '${libName}' not found. Available libraries/lists:`)
      discoveryResult.lists.slice(0, 10).forEach((list) => {
        console.log(`  - ${list.title} [${list.baseTemplateDescription}]`)
      })
      if (discoveryResult.lists.length > 10) {
        console.log(`  ... and ${discoveryResult.lists.length - 10} more`)
      }
      return { success: false, errorType: 'LIBRARY_NOT_FOUND' }
    }
  } catch (error) {
    console.error(`SharePoint validation error for ${uri}:`, error)

    // Determine error type based on the error
    const errorMessage = error instanceof Error ? error.message : String(error)

    if (errorMessage.includes('401') || errorMessage.includes('403') || errorMessage.includes('authentication')) {
      return { success: false, errorType: 'AUTHENTICATION_ERROR' }
    } else if (
      errorMessage.includes('404') ||
      errorMessage.includes('not found') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('getaddrinfo')
    ) {
      return { success: false, errorType: 'NOT_FOUND' }
    } else if (
      errorMessage.includes('network') ||
      errorMessage.includes('fetch') ||
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('timeout')
    ) {
      return { success: false, errorType: 'NETWORK_ERROR' }
    } else {
      return { success: false, errorType: 'UNKNOWN_ERROR' }
    }
  }
}
