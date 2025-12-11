/**
 * Upsert Product Action
 *
 * Creates or updates products in Shopware 6 using product number (SKU) as identifier
 */
import { z } from 'zod'

import { transformValue } from '../../transforms'
import type { ActionExecutionResult, ActionInput, ConnectorAction, ConnectorConfig } from '../../types'
import type { TransformType } from '../../validation'
import { createApiClient, createProduct, getDefaultTaxId, searchProductByNumber, updateProduct } from '../api'

/**
 * Field mapping configuration
 */
const FieldMappingSchema = z.object({
  /** The enrichment field ID to read from */
  sourceFieldId: z.string().min(1, 'Source field is required'),
  /** The Shopware product field to write to */
  targetField: z.string().min(1, 'Target field is required'),
  /** Transform to apply before writing */
  transform: z.enum(['raw', 'markdownToHtml', 'number', 'boolean']).default('raw'),
})

/**
 * Action configuration schema
 */
const UpsertProductConfigSchema = z.object({
  /** Product number field - which enrichment field contains the SKU */
  productNumberField: z.string().min(1, 'Product number field is required'),
  /** Whether to create product if not found (default: true) */
  createIfNotExists: z.boolean().default(true),
  /** Language ID to write to (optional - uses default if not specified) */
  languageId: z.string().optional(),
  /** Field mappings - which enrichment fields map to which Shopware fields */
  fieldMappings: z.array(FieldMappingSchema).min(1, 'At least one field mapping is required'),
})

export type UpsertProductConfig = z.infer<typeof UpsertProductConfigSchema>

/**
 * Execute the upsert product action
 */
async function execute(connectorConfig: ConnectorConfig, input: ActionInput): Promise<ActionExecutionResult> {
  const config = UpsertProductConfigSchema.parse(input.actionConfig)

  // Get product number from enrichment field
  const productNumber = input.item.fieldValues[config.productNumberField]
  if (!productNumber || typeof productNumber !== 'string') {
    return {
      status: 'skipped',
      message: `No product number found in field "${config.productNumberField}"`,
    }
  }

  // Build the data payload from field mappings
  const productData: Record<string, unknown> = {}

  for (const mapping of config.fieldMappings) {
    const sourceValue = input.item.fieldValues[mapping.sourceFieldId]
    if (sourceValue !== undefined && sourceValue !== null) {
      productData[mapping.targetField] = transformValue(sourceValue, mapping.transform as TransformType)
    }
  }

  if (Object.keys(productData).length === 0) {
    return {
      status: 'skipped',
      message: 'No field values to upsert',
    }
  }

  try {
    // Create API client
    const client = await createApiClient(connectorConfig.baseUrl, {
      clientId: connectorConfig.credentials.clientId,
      clientSecret: connectorConfig.credentials.clientSecret,
    })

    // Search for existing product by product number
    const existingProduct = await searchProductByNumber(client, productNumber, config.languageId)

    if (existingProduct) {
      // Product exists - update it
      await updateProduct(client, existingProduct.id, productData, config.languageId)

      return {
        status: 'success',
        message: `Updated product ${productNumber}`,
        data: {
          productId: existingProduct.id,
          productNumber,
          operation: 'updated',
          updatedFields: Object.keys(productData),
        },
      }
    } else {
      // Product doesn't exist
      if (!config.createIfNotExists) {
        return {
          status: 'skipped',
          message: `Product ${productNumber} not found and createIfNotExists is disabled`,
        }
      }

      // Validate required fields for creation
      if (!productData.name) {
        return {
          status: 'failed',
          message: 'Cannot create product: "name" field is required. Please map a field to Product Name.',
          error: 'Missing required field: name',
        }
      }

      // Get default tax ID for new products
      const taxId = await getDefaultTaxId(client)

      // Create new product with required fields
      const createData = {
        productNumber,
        taxId,
        stock: 0, // Default stock
        active: true, // Default active
        ...productData,
      }

      const result = await createProduct(client, createData, config.languageId)

      return {
        status: 'success',
        message: `Created product ${productNumber}`,
        data: {
          productId: result.id,
          productNumber,
          operation: 'created',
          createdFields: Object.keys(productData),
        },
      }
    }
  } catch (error) {
    return {
      status: 'failed',
      message: 'Failed to upsert product',
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Preview what will be written without executing
 */
async function preview(connectorConfig: ConnectorConfig, input: ActionInput): Promise<Record<string, unknown>> {
  const config = UpsertProductConfigSchema.parse(input.actionConfig)

  const productNumber = input.item.fieldValues[config.productNumberField]
  const productData: Record<string, unknown> = {}

  for (const mapping of config.fieldMappings) {
    const sourceValue = input.item.fieldValues[mapping.sourceFieldId]
    if (sourceValue !== undefined && sourceValue !== null) {
      productData[mapping.targetField] = transformValue(sourceValue, mapping.transform as TransformType)
    }
  }

  // Try to determine if product exists (for preview)
  let existingProductId: string | null = null
  let operation: 'create' | 'update' | 'unknown' = 'unknown'

  if (productNumber && typeof productNumber === 'string') {
    try {
      const client = await createApiClient(connectorConfig.baseUrl, {
        clientId: connectorConfig.credentials.clientId,
        clientSecret: connectorConfig.credentials.clientSecret,
      })

      const existing = await searchProductByNumber(client, productNumber, config.languageId)
      if (existing) {
        existingProductId = existing.id
        operation = 'update'
      } else {
        operation = config.createIfNotExists ? 'create' : 'unknown'
      }
    } catch {
      // Silently fail preview lookup - we'll still show the payload
    }
  }

  return {
    productNumber,
    existingProductId,
    operation,
    languageId: config.languageId,
    createIfNotExists: config.createIfNotExists,
    payload: productData,
  }
}

/**
 * Default configuration for newly created automations
 */
const defaultConfig: UpsertProductConfig = {
  productNumberField: '',
  createIfNotExists: true,
  fieldMappings: [],
}

/**
 * Upsert Product action definition
 */
export const upsertProductAction: ConnectorAction = {
  id: 'upsertProduct',
  name: 'Upsert Product',
  description: 'Creates or updates products in Shopware 6 using product number (SKU) as identifier',
  configSchema: UpsertProductConfigSchema,
  defaultConfig,
  configFields: [
    {
      id: 'productNumberField',
      name: 'Product Number Field',
      description: 'Select the enrichment field that contains the product number (SKU)',
      type: 'listFieldSelect',
      required: true,
    },
    {
      id: 'createIfNotExists',
      name: 'Create if not exists',
      description: 'Create a new product if the SKU is not found in Shopware',
      type: 'boolean',
      required: false,
    },
    {
      id: 'fieldMappings',
      name: 'Field Mappings',
      description: 'Map enrichment fields to Shopware product fields',
      type: 'fieldMappings',
      required: true,
      targetFields: [
        { id: 'name', name: 'Product Name', description: 'Product display name (required for creation)' },
        { id: 'description', name: 'Description', description: 'Product description (HTML)' },
        { id: 'metaDescription', name: 'Meta Description', description: 'SEO meta description' },
        { id: 'metaTitle', name: 'Meta Title', description: 'SEO meta title' },
        { id: 'keywords', name: 'Keywords', description: 'SEO keywords' },
        { id: 'customSearchKeywords', name: 'Search Keywords', description: 'Custom search keywords' },
        { id: 'active', name: 'Active', description: 'Product active status (boolean)' },
        { id: 'stock', name: 'Stock', description: 'Stock quantity (number)' },
      ],
      transforms: [
        { id: 'raw', name: 'Raw', description: 'No transformation' },
        { id: 'markdownToHtml', name: 'Markdown to HTML', description: 'Convert Markdown to HTML' },
        { id: 'number', name: 'Number', description: 'Convert to number' },
        { id: 'boolean', name: 'Boolean', description: 'Convert to boolean' },
      ],
    },
  ],
  execute,
  preview,
}
