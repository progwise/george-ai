import { builder } from '../builder'
import { discoverSharePointSiteContent } from './sharepoint-discovery'

// Reuse the parsing function from crawl-sharepoint.ts
function parseSharePointUrl(uri: string) {
  console.log(`Parsing Sharepoint URI ${uri}`)
  try {
    const cleanUri = uri.endsWith('/') ? uri.slice(0, -1) : uri
    const fullUrl = new URL(cleanUri)
    const pathParts = fullUrl.pathname.split('/').filter((part) => part.length > 0)
    // For downloading files, we need the base SharePoint site URL (without library path)
    const siteUrl = new URL(`${fullUrl.protocol}//${fullUrl.host}`)
    const apiUrl = new URL(`${fullUrl.protocol}//${fullUrl.host}/_api`)
    const libName = pathParts[pathParts.length - 1]
    const siteName = pathParts.slice(0, -1).join('/')
    console.log(`Parsed - siteUrl: ${siteUrl}, apiUrl: ${apiUrl}, libName: ${libName}`)
    return { siteUrl, apiUrl, siteName, libName }
  } catch (error) {
    console.error(`Error parsing sharepoint URL ${uri}`, error)
    throw error
  }
}

/**
 * Validates SharePoint connection by checking if the document library exists
 * This runs on the backend where the actual crawling happens
 */
async function validateSharePointConnection(
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

// Define the SharePoint validation result type
const SharePointValidationResult = builder
  .objectRef<{ success: boolean; errorMessage: string | null; errorType: string | null }>('SharePointValidationResult')
  .implement({
    fields: (t) => ({
      success: t.boolean({
        resolve: (parent) => parent.success,
      }),
      errorMessage: t.string({
        nullable: true,
        resolve: (parent) => parent.errorMessage,
      }),
      errorType: t.string({
        nullable: true,
        resolve: (parent) => parent.errorType,
      }),
    }),
  })

// GraphQL mutation for validating SharePoint connections
builder.mutationField('validateSharePointConnection', (t) =>
  t.field({
    type: SharePointValidationResult,
    nullable: false,
    args: {
      uri: t.arg.string({ required: true }),
      sharepointAuth: t.arg.string({ required: true }),
    },
    resolve: async (_source, { uri, sharepointAuth }) => {
      // Redact auth cookie in logs
      console.log(`Received SharePoint validation request for ${uri} with auth: ***`)

      try {
        const result = await validateSharePointConnection(uri, sharepointAuth)

        if (result.success) {
          return {
            success: true,
            errorMessage: null,
            errorType: null,
          }
        } else {
          // Get appropriate error message based on error type
          let errorMessage: string
          switch (result.errorType) {
            case 'LIBRARY_NOT_FOUND': {
              const { libName } = parseSharePointUrl(uri)
              errorMessage = `Document library '${libName}' not found`
              break
            }
            case 'AUTHENTICATION_ERROR':
              errorMessage = 'SharePoint authentication failed'
              break
            case 'NOT_FOUND':
              errorMessage = 'SharePoint site not found or unreachable'
              break
            case 'NETWORK_ERROR':
              errorMessage = 'Network error connecting to SharePoint'
              break
            default:
              errorMessage = 'SharePoint validation failed'
          }

          return {
            success: false,
            errorMessage,
            errorType: result.errorType || 'UNKNOWN_ERROR',
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        console.error(`SharePoint validation error: ${errorMessage}`)

        return {
          success: false,
          errorMessage,
          errorType: 'UNKNOWN_ERROR',
        }
      }
    },
  }),
)

export { parseSharePointUrl, validateSharePointConnection }
