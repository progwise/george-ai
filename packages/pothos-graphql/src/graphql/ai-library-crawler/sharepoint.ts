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
async function validateSharePointConnection(uri: string, sharepointAuth: string): Promise<boolean> {
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
      return true
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
      return true
    } else {
      console.log(`SharePoint library '${libName}' not found. Available libraries/lists:`)
      discoveryResult.lists.slice(0, 10).forEach((list) => {
        console.log(`  - ${list.title} [${list.baseTemplateDescription}]`)
      })
      if (discoveryResult.lists.length > 10) {
        console.log(`  ... and ${discoveryResult.lists.length - 10} more`)
      }
      return false
    }
  } catch (error) {
    console.error(`SharePoint validation error for ${uri}:`, error)
    return false
  }
}

// GraphQL mutation for validating SharePoint connections
builder.mutationField('validateSharePointConnection', (t) =>
  t.field({
    type: 'Boolean',
    nullable: false,
    args: {
      uri: t.arg.string({ required: true }),
      sharepointAuth: t.arg.string({ required: true }),
    },
    resolve: async (_source, { uri, sharepointAuth }) => {
      // Redact auth cookie in logs
      console.log(`Received SharePoint validation request for ${uri} with auth: ***`)
      return await validateSharePointConnection(uri, sharepointAuth)
    },
  }),
)

export { parseSharePointUrl, validateSharePointConnection }
