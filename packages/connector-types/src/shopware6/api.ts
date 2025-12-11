/**
 * Shopware 6 API Client
 *
 * Provides methods for interacting with the Shopware 6 Admin API
 * Consistent with api-crawler/src/providers/shopware6.ts patterns
 */
import { getAccessToken } from './auth'

export interface ShopwareCredentials {
  clientId: string
  clientSecret: string
}

export interface ShopwareLanguage {
  id: string
  name: string
  localeCode: string
}

export interface ShopwareSalesChannel {
  id: string
  name: string
}

export interface ShopwareApiClient {
  baseUrl: string
  accessToken: string
}

/**
 * Create an authenticated API client for Shopware 6
 */
export async function createApiClient(baseUrl: string, credentials: ShopwareCredentials): Promise<ShopwareApiClient> {
  const base = baseUrl.replace(/\/$/, '')
  const accessToken = await getAccessToken(base, credentials)

  return {
    baseUrl: base,
    accessToken,
  }
}

/**
 * Make an authenticated API request
 */
async function apiRequest<T>(
  client: ShopwareApiClient,
  method: string,
  endpoint: string,
  body?: unknown,
  languageId?: string,
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${client.accessToken}`,
    Accept: 'application/json',
  }

  // Set language header for multi-language support
  if (languageId) {
    headers['sw-language-id'] = languageId
  }

  const response = await fetch(`${client.baseUrl}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Shopware API error: ${response.status} ${errorText}`)
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T
  }

  return response.json() as Promise<T>
}

/**
 * Get available languages from Shopware using Search API (POST)
 */
export async function getLanguages(client: ShopwareApiClient): Promise<ShopwareLanguage[]> {
  interface LanguagesResponse {
    data: Array<{
      id: string
      translated?: { name?: string }
      name?: string
      locale?: {
        code?: string
        translated?: { code?: string }
      }
    }>
  }

  // Use Search API with POST as per existing api-crawler pattern
  const response = await apiRequest<LanguagesResponse>(client, 'POST', '/api/search/language', {
    associations: {
      locale: {},
    },
  })

  return response.data.map((lang) => ({
    id: lang.id,
    name: lang.translated?.name || lang.name || 'Unknown',
    localeCode: lang.locale?.translated?.code || lang.locale?.code || 'unknown',
  }))
}

/**
 * Get available sales channels from Shopware using Search API (POST)
 */
export async function getSalesChannels(client: ShopwareApiClient): Promise<ShopwareSalesChannel[]> {
  interface SalesChannelsResponse {
    data: Array<{
      id: string
      translated?: { name?: string }
      name?: string
    }>
  }

  // Use Search API with POST as per existing api-crawler pattern
  const response = await apiRequest<SalesChannelsResponse>(client, 'POST', '/api/search/sales-channel', {})

  return response.data.map((channel) => ({
    id: channel.id,
    name: channel.translated?.name || channel.name || 'Unknown',
  }))
}

/**
 * Update a product in Shopware
 */
export async function updateProduct(
  client: ShopwareApiClient,
  productId: string,
  data: Record<string, unknown>,
  languageId?: string,
): Promise<void> {
  await apiRequest(client, 'PATCH', `/api/product/${productId}`, data, languageId)
}

/**
 * Get a product by ID
 */
export async function getProduct(
  client: ShopwareApiClient,
  productId: string,
  languageId?: string,
): Promise<Record<string, unknown>> {
  interface ProductResponse {
    data: {
      id: string
      [key: string]: unknown
    }
  }

  const response = await apiRequest<ProductResponse>(client, 'GET', `/api/product/${productId}`, undefined, languageId)

  return response.data
}

/**
 * Search for a product by product number (SKU)
 */
export async function searchProductByNumber(
  client: ShopwareApiClient,
  productNumber: string,
  languageId?: string,
): Promise<{ id: string; productNumber: string } | null> {
  interface SearchResponse {
    data: Array<{
      id: string
      productNumber: string
    }>
  }

  const response = await apiRequest<SearchResponse>(
    client,
    'POST',
    '/api/search/product',
    {
      filter: [{ type: 'equals', field: 'productNumber', value: productNumber }],
      limit: 1,
    },
    languageId,
  )

  if (response.data.length === 0) {
    return null
  }

  return {
    id: response.data[0].id,
    productNumber: response.data[0].productNumber,
  }
}

/**
 * Create a new product in Shopware
 */
export async function createProduct(
  client: ShopwareApiClient,
  data: Record<string, unknown>,
  languageId?: string,
): Promise<{ id: string }> {
  interface CreateResponse {
    data: {
      id: string
    }
  }

  // Shopware returns 204 No Content on successful creation via POST
  // but we need the ID, so we use the sync endpoint which returns the created entity
  const response = await apiRequest<CreateResponse>(client, 'POST', '/api/product?_response=detail', data, languageId)

  return { id: response.data.id }
}

/**
 * Get the default tax ID from Shopware
 * Returns the first tax rate found
 */
export async function getDefaultTaxId(client: ShopwareApiClient): Promise<string> {
  interface TaxResponse {
    data: Array<{
      id: string
      name: string
      taxRate: number
    }>
  }

  const response = await apiRequest<TaxResponse>(client, 'POST', '/api/search/tax', {
    limit: 1,
  })

  if (response.data.length === 0) {
    throw new Error('No tax rates found in Shopware. Please configure at least one tax rate.')
  }

  return response.data[0].id
}

/**
 * Test the connection to Shopware
 */
export async function testConnection(
  baseUrl: string,
  credentials: ShopwareCredentials,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const client = await createApiClient(baseUrl, credentials)

    // Try to fetch languages as a simple health check
    const languages = await getLanguages(client)

    return {
      success: true,
      message: `Connected to Shopware 6. Found ${languages.length} language(s).`,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}
